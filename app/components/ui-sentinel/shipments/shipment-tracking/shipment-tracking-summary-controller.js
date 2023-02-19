(function () {
    'use strict';

    angular
        .module('ui-sentinel.shipments.shipmentTracking')
        .controller('ShipmentTrackingSummaryController', ShipmentTrackingSummaryController);



    ShipmentTrackingSummaryController.$inject = ['$rootScope','$timeout', '$scope', '$state', '$stateParams', 'ShipmentTrackingReportsService', 'ShipmentTrackingFilterService', 'DevicesService', 'ShipmentsService', 'GoogleStaticMapApiKey', 'ClientsService', 'SentinelUiSession','AccountApiService'];
    function ShipmentTrackingSummaryController($rootScope,$timeout, $scope, $state, $stateParams, ShipmentTrackingReportsService, ShipmentTrackingFilterService, DevicesService, ShipmentsService, GoogleStaticMapApiKey, ClientsService, SentinelUiSession, AccountApiService) {

        var _timelineDivId = 'summaryTimeline';
        var _printButtonId = 'print-summary-button';
        var _reportsService = ShipmentTrackingReportsService;
        var _filterService = ShipmentTrackingFilterService;
        var _timeline = {
            container: document.getElementById(_timelineDivId),
            control: null,
            dataSet: new vis.DataSet({}),
            groups: [
                {
                    id: 'line',
                    options: {
                        drawPoints: {
                            enabled: false
                        }
                    },
                    className: 'print-summary-graph-line'
                },
                {
                    id: 'ok',
                    options: {
                        style: 'points',
                        drawPoints: {
                            size: 10,
                            enabled: true,
                            style: 'image',
                            imageUrl: '../img/print-ok-circle.png'
                        }
                    }
                },
                {
                    id: 'info',
                    options: {
                        style: 'points',
                        drawPoints: {
                            size: 14,
                            enabled: true,
                            style: 'image',
                            imageUrl: '../img/print-info-circle.png'
                        }
                    }
                },
                {
                    id: 'warning',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 14,
                            style: 'image',
                            imageUrl: '../img/print-alarm-circle.png'
                        }
                    }
                }                
            ],
            options: {
                width: '100%',
                height: '240px',
                orientation: 'top',
                sort: false,
                sampling: false,
                moveable: false,
                showCurrentTime: false,
                start: _reportsService.fromDate,
                end: _reportsService.toDate,
                dataAxis: {
                    left: {
                        title: {
                            text: _filterService.filterByPropertyName
                        }
                    }
                }
            }
        };

        var vm = {
            shipment: {
                referenceNumber: null,
                destination: null,
                stops: null,
                endDate: null,
                status: null,
                deviceTagId: null,
                deviceName: null,
                notes: null
            },
            reportName: _filterService.filterByPropertyName,
            propertyName: _filterService.range.property,
            now: moment().format('L LTS'),
            timezoneOffset: moment().format('Z'),
            unitOfMeasure: _filterService.range.suffix,
            mean: null,
            stdDev: null,
            min: null,
            max: null,
            fromDate: null,
            toDate: null,
            staticMapUrl: null,
            reports: null,
            alarms: [],
            filter: filter,
            print: print,
            justify: justify
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////


        function activate() {
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'shipment.summary') {
                    $state.go('shipments.map');
                }
                _reportsService.clear();
            });

            var shipmentId = $stateParams.shipmentId;
            loadShipment(shipmentId);
            loadLogo(SentinelUiSession.focus);

            _timeline.control = new vis.Graph2d(_timeline.container, _timeline.dataSet, _timeline.groups, _timeline.options);

            $scope.$watchCollection(
                function() {
                    return _reportsService.reports;
                },
                function (reports) {
                    onReportsChange(reports);
                }
            );
            $scope.$watchCollection(
                function() {
                    return _filterService;
                },
                function () {
                    if ($rootScope.$state.current.name !== 'shipment.summary') {
                        return;
                    }

                    onFilterChange();
                }
            );
            $scope.$watchCollection(
                function() {
                    return _filterService.range;
                },
                function () {
                    if ($rootScope.$state.current.name !== 'shipment.summary') {
                        return;
                    }

                    onFilterChange();
                }
            );

            if (shipmentId !== _reportsService.shipmentId) {
                _reportsService.init(shipmentId);
            }
        }

        function loadLogo(client){
            var image = document.getElementById('print-summary-logo');

            var promise = AccountApiService.getEmailLogo(client).$promise;
            promise.then(
                function (result) {
                    if (!result || !result.url) {
                        image.src = window.location.origin +  '/img/DefaultEmailLogo.png';
                        return;
                    }

                    image.src = result.url;
                },
                function (error) {
                    image.src = window.location.origin +  '/img/DefaultEmailLogo.png';
                }
            );
        }

        function loadShipment(shipmentId) {
            var promise = ShipmentsService.getShipment(shipmentId).$promise;
            $rootScope.loading = true;
            promise.then(
                function (shipment) {
                    $rootScope.loading = false;
                    $state.current.data.subTitle = shipment.shipmentInfo.referenceNumber;
                    vm.shipment.shipmentId = shipment.shipmentInfo.shipmentId;
                    vm.shipment.referenceNumber = shipment.shipmentInfo.referenceNumber;
                    vm.shipment.status = shipment.shipmentInfo.status;
                    vm.shipment.endDate = shipment.shipmentInfo.endDate;
                    vm.shipment.startDate = shipment.shipmentInfo.startDate;
                    vm.shipment.deviceTagId = shipment.shipmentInfo.deviceTagId;
                    vm.shipment.notes = shipment.shipmentInfo.notes;
                    vm.shipment.stops = shipment.shipmentStops;

                    var devicePromise = DevicesService.getDevice(shipment.shipmentInfo.deviceTagId).$promise;
                    devicePromise.then(
                        function (device) {
                            vm.shipment.deviceName = device.deviceName !== device.deviceTagId ? device.deviceName : null;
                        },
                        function (error) {
                            
                        }
                    );

                },
                function (error) {
                    $rootScope.loading = false;
                   // vm.feedback.addError(error.data.message);
                }
            );
        }

        function justify(value) {
            if (typeof value === 'undefined' || value === null) {
                return '';
            }

            if (isNaN(value)) {
                return value;
            }

            return '' + Number(value).toFixed(2);
        }

        function onFilterChange() {
            _filterService.save();
            vm.reportName = _filterService.filterByPropertyName;
            vm.propertyName = _filterService.range.property;
            vm.unitOfMeasure = _filterService.range.suffix;
            onReportsChange(_reportsService.reports);
        }

        function onReportsChange(reports) {
            vm.reports = reports;
            vm.alarms = [];

            var polylineCoordinates = [];
            var items = [];
            var values = [];

            _.forEach(vm.reports, function(report) {
                if (report.latitude !== null && report.longitude !== null) {
                    polylineCoordinates.push(new google.maps.LatLng(report.latitude, report.longitude));
                }

                if (typeof report[_filterService.range.property] !== 'undefined' && report[_filterService.range.property] !== null) {
                    values.push(report[_filterService.range.property]);
                    items.push({
                        id: 'line-' + report.reportGuid,
                        x: moment(report.messageTimeStamp).local().toDate().valueOf(),
                        y: report[_filterService.range.property],
                        group: 'line'
                    });

                    if (_filterService.filter(report)) {
                        items.push({
                            id: report.severity + '-' + report.reportGuid,
                            x: moment(report.messageTimeStamp).local().toDate().valueOf(),
                            y: report[_filterService.range.property],
                            group: report.severity
                        });
                    }
                }
            });

            vm.mean = Math.round(_.mean(values)*100)/100;
            vm.min = _.min(values);
            vm.max = _.max(values);

            var stdDev = [];
            _.forEach(values, function (v)  {
                stdDev.push(Math.pow(v - vm.mean, 2));
            });
            vm.stdDev = Math.round(Math.sqrt(_.mean(stdDev)) * 100) / 100;

            drawMap(polylineCoordinates);
            drawTimeline(items);
        }

        function drawMap(polylineCoordinates) {
            vm.staticMapUrl = null;
            var staticMapUrl = 'https://maps.googleapis.com/maps/api/staticmap?';
            var staticMapUrlKey = '&key=' + GoogleStaticMapApiKey;

            var defaultParams = '&size=400x400&scale=2&maptype=roadmap&format=png32';

            //add the stop markers
            var stopMarkers = '';
            _.forEach(vm.shipment.stops, function (stop, index) {
                stopMarkers += '&markers=color:0xFFE128|label:' + index + '|' + stop.addressLatitude + ',' + stop.addressLongitude;
            });

            //add the alarm markers?
            var warnMarkers = '';
            var infoMarkers = '';
            var okMarkers = '';
            _.forEach(vm.reports, function (report, index) {
                if ((!report.latitude && !report.longitude) || !_filterService.filter(report)) {
                    return;
                }

                switch (report.severity) {
                    case 'info':
                        infoMarkers += _filterService.showInfo ? '|' + report.latitude + ',' + report.longitude : '';
                        break;
                    case 'warning':
                        warnMarkers += _filterService.showWarning ? '|' + report.latitude + ',' + report.longitude : '';
                        break;
                    default:
                        okMarkers += _filterService.showOk ? '|' + report.latitude + ',' + report.longitude : '';
                }
            });

            var webHost = window.location.origin;
            if (webHost === 'http://localhost:3081') {
                webHost = 'http://vision.onasset.com';
            }

            if (warnMarkers.length > 0) {
                warnMarkers = '&markers=anchor:center|icon:' + webHost + '/img/print-alarm-circle.png' + warnMarkers;
            }
            if (infoMarkers.length > 0) {
                infoMarkers = '&markers=anchor:center|icon:' + webHost + '/img/print-info-circle.png' + infoMarkers;
            }
            if (okMarkers.length > 0) {
                okMarkers = '&markers=anchor:center|icon:' + webHost + '/img/print-ok-circle.png' + okMarkers;
            }

            //calculate the path
            var encodedPath = google.maps.geometry.encoding.encodePath(polylineCoordinates);
            var bgPathParam = '&path=color:0x00000099|weight:5|geodesic:false|enc:' + encodedPath;
            var fgPathParam = '&path=color:0x00ffc8cc|weight:3|geodesic:false|enc:' + encodedPath;

            var staticMapUrlTemp = staticMapUrl + encodeURI(defaultParams + stopMarkers + warnMarkers + infoMarkers + okMarkers + bgPathParam + fgPathParam) + staticMapUrlKey;
            if (staticMapUrlTemp.length > 8192) {
                //remove okMarkers
                staticMapUrlTemp = staticMapUrl + encodeURI(defaultParams + stopMarkers + warnMarkers + infoMarkers + bgPathParam + fgPathParam) + staticMapUrlKey;
            }
            if (staticMapUrlTemp.length > 8192) {
                //remove infoMarkers
                staticMapUrlTemp = staticMapUrl + encodeURI(defaultParams + stopMarkers + warnMarkers + bgPathParam + fgPathParam) + staticMapUrlKey;
            }
            if (staticMapUrlTemp.length > 8192) {
                //remove warnMarkers
                staticMapUrlTemp = staticMapUrl + encodeURI(defaultParams + stopMarkers + bgPathParam + fgPathParam) + staticMapUrlKey;
            }
            vm.staticMapUrl = staticMapUrlTemp;
            $timeout(setTop,500);
        }

        function drawTimeline(items) {
            _timeline.dataSet.clear();
            _timeline.dataSet.add(items);


            vm.toDate =  moment(_reportsService.toDate.value).format('L LTS');//moment(lastReport.messageTimeStamp).local().format('L LTS');
            vm.fromDate = moment(_reportsService.fromDate.value).format('L LTS'); //moment(firstReport.messageTimeStamp).local().format('L LTS');

            _timeline.control.setOptions({
                dataAxis: {
                    left: {
                        title: {
                            text: _filterService.filterByPropertyName
                        },
                        format: function (value) {
                            return '' + Math.round(value);
                        }
                    }
                },
                groups: {
                    visibility: {
                        line: true,
                        ok: _filterService.showOk,
                        info : _filterService.showInfo,
                        warning : _filterService.showWarning
                    }
                }
            });
            _timeline.control.fit();
            _timeline.control.redraw();
        }

        function filter(report) {
            return _filterService.filter(report);
        }

        function print() {
            $(_printButtonId).blur();
            var content = document.getElementById('print-container');
            var printWindow = window.open('','_blank','height=800,width=770,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no,top=50');
            printWindow.focus(); //necessary for IE >= 10
            printWindow.document.open();
            printWindow.document.write('<!DOCTYPE html><html><head><title>' + vm.reportName + ' Report</title>');
            printWindow.document.write('<link rel="stylesheet" href="css/vis.min.css">');
            printWindow.document.write('<link rel="stylesheet" href="css/print.css">');
            printWindow.document.write('</head><body class="print-summary-body" onload="window.print(); window.close();">' + content.innerHTML + '</body></html>');
            //printWindow.document.write('</head><body class="print-summary-body">' + content.innerHTML + '</body></html>');
            printWindow.document.close();  // necessary for IE >= 10

            printWindow.postMessage(vm.logoBlob, window.location.origin);
        }

        function setTop(){

            let size =  $("#print-summary-info > table").height();
            if(size<400)
              size=400;
            $("#print-summary-sensor").css("top",(size+100)+"px");
            $("#print-timeline-container").css("top",(size+160)+"px");
            $("#print-summary-alarm").css("top",(size+410)+"px");
        }
    }
})();