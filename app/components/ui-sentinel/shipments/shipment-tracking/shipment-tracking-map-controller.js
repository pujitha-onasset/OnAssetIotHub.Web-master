(function () {
    'use strict';

    angular
        .module('ui-sentinel.shipments.shipmentTracking')
        .controller('ShipmentTrackingMapController', ShipmentTrackingMapController);


    ShipmentTrackingMapController.$inject = ['$rootScope', '$scope', '$state', '$filter', '$stateParams', 'SentinelUiSession', 'localStorageService', 'ShipmentTrackingReportsService', 'ShipmentTrackingFilterService', 'MapsConstants', 'ShipmentListService', 'ShipmentsService', 'FeedbackService', 'UomSecondsConverter', 'UomDistanceConverter'];
    function ShipmentTrackingMapController($rootScope, $scope, $state, $filter, $stateParams, SentinelUiSession, localStorageService, ShipmentTrackingReportsService, ShipmentTrackingFilterService, MapsConstants, ShipmentListService, ShipmentsService, FeedbackService, UomSecondsConverter, UomDistanceConverter) {
        var googleMapDivId = 'shipmentTrackingMap';

        var markerZIndices = {
            'stop': 9,
            'ok-network': 10,
            'ok-gps': 11,
            'info-network': 12,
            'info-gps': 13,
            'warning-network': 14,
            'warning-gps': 15,
            'selected': 20
        };

        var vm = {
            shipment: null,
            map: null,
            mapType: MapsConstants.mapTypes.hybrid,
            mapTypes: MapsConstants.mapTypes,
            mapZooms: MapsConstants.zooms,
            mapShapeStyles: MapsConstants.shapes,
            filterService: ShipmentTrackingFilterService,
            reportsService: ShipmentTrackingReportsService,
            secondsService: UomSecondsConverter,
            feedback: FeedbackService,
            zoomLimit: 10,
            zoomLevel: null,
            center: null,
            reportMarkers: [],
            polyline: null,
            polylineBg: null,
            selectedReportMarker: null,
            selectedIndex: null,
            nextReport: null,
            previousReport: null,
            stopMarkers: [],
            selectedStopMarker: null,
            onReportsChange: onReportsChange,
            onSelectedReportChange: onSelectedReportChange,
            onFilterChange: onFilterChange,
            actions: {
                map: {
                    setType: setType,
                    panToReports: panToReports,
                    panToStops: panToStops
                },
                reportMarker: {
                    panTo: panToReportMarker,
                    centerOnTimeline: centerOnTimeline
                },
                selectReport: selectReport,
                closeReportDetails: closeReportDetails,
                closeStopDetails: closeStopDetails,
                goToDeviceAdmin: goToDeviceAdmin,
                goToShipmentAdmin: goToShipmentAdmin,
                gotoSightingsForReport: gotoSightingsForReport,
                panToStop: panToStop
            }
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////


        function activate() {
            vm.feedback.clear();

            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'shipment.map') {
                    $state.go('shipments.map');
                }
                vm.reportsService.clear();
            });

            var shipmentId = $stateParams.shipmentId;
            loadShipment(shipmentId);
            //loadShipmentStops(shipmentId);

           // if (shipmentId !== vm.reportsService.shipmentId) {
                vm.reportsService.init(shipmentId);
            //}

            initMap();

            $scope.$watchCollection(
                function() {
                    return vm.reportsService.reports;
                },
                function (reports) {
                    onReportsChange(reports);
                }
            );
            $scope.$watch(
                function() {
                    return vm.reportsService.selected;
                },
                function (report) {
                    onSelectedReportChange(report);
                }, true
            );
            $scope.$watch(
                function() {
                    return vm.filterService;
                },
                function () {
                    onFilterChange();
                }, true
            );
        }

        function addReportMarkerListeners(marker) {
            google.maps.event.addListener(marker, 'click', function() {
                onReportMarkerClick(marker);
                $scope.$apply();
            });
        }

        function centerOnTimeline() {
            if (vm.reportsService.selected) {
                vm.reportsService.selected.centerOnTimeline();
            }
            $('#btn-details-center-timeline').blur();
        }
        
        function addStopMarkerListeners(marker) {
            google.maps.event.addListener(marker, 'click', function() {
                onStopMarkerClick(marker);
                $scope.$apply();
            });
        }

        function clearMarkers() {
            _.forEach(vm.reportMarkers, function(marker) {
                marker.setMap(null);
            });
            vm.reportMarkers = [];
        }


        function clearPolyline() {
            if (vm.polyline) {
                vm.polyline.setMap(null);
                vm.polyline = null;
                vm.polylineBg.setMap(null);
                vm.polylineBg = null;
            }
        }

        function closeReportDetails() {
            vm.reportsService.selected = null;
        }

        function closeStopDetails() {
            vm.selectedStopMarker.setMap(null);
            vm.selectedStopMarker = null;
        }

        function getPolygonCoordinates(geofence) {
            var coords = [];
            var coord;
            var points = geofence.shapeText.replace('POLYGON ((','').replace('))','').split(', ');
            _.forEach(points, function(point) {
                coord = point.trim().split(' ');
                coords.push(new google.maps.LatLng(Number(coord[1]), Number(coord[0])));
            });

            return coords;
        }

        function goToDeviceAdmin() {
            if (vm.reportsService.selected) {
                //$state.go('device.admin',{ deviceTagId: vm.reportsService.selected.deviceTagId, referrer: 'shipment.map', referrerParams: { shipmentId: vm.shipment.shipmentId } });
                $state.go('sentry-configs.by-device', { assignmentAccountId: SentinelUiSession.user.accountId, imei: vm.reportsService.selected.deviceTagId });
            }
        }

        function goToShipmentAdmin() {
            $state.go('shipment.admin',{ shipmentId: vm.shipment.shipmentId, referrer: 'shipment.map', referrerParams: { shipmentId: vm.shipment.shipmentId } });
        }

        function gotoSightingsForReport() {
            if (vm.reportsService.selected) {
                $state.go('sightings.for-report', { reportId: vm.reportsService.selected.reportGuid, from:vm.reportsService.fromDate.toISOString(), to:vm.reportsService.toDate.toISOString() });
            }
        }

        function handleIdle() {
            vm.center = {
                lat: Math.round(vm.map.getCenter().lat() * 1000000) / 1000000,
                lng: Math.round(vm.map.getCenter().lng() * 1000000) / 1000000
            };
            vm.zoomLevel = vm.map.getZoom();

            localStorageService.set('mapCenter', vm.center);
            localStorageService.set('mapZoomShipmentTracking', vm.zoomLevel);
            $scope.$apply();
        }

        function initMap() {
            var mapCenter = localStorageService.get('mapCenter');
            var mapZoom = localStorageService.get('mapZoomShipmentTracking');

            vm.map = new google.maps.Map(document.getElementById(googleMapDivId), {
                zoom: mapZoom || MapsConstants.zooms.world.zoomLevel,
                minZoom: 2,
                center: mapCenter || MapsConstants.zooms.world.center,
                mapTypeId: vm.mapType.type,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.TERRAIN]
                }
            });

            vm.map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('centerZoomLabel'));
            vm.map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('reportsZoom'));
            vm.map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('stopsZoom'));
            vm.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('legendTool'));
            vm.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('mapPropTool'));
            onWindowResize();

            google.maps.event.addListener(vm.map, 'idle', handleIdle);
            google.maps.event.addListener(vm.map, 'click', onMapClick);
            google.maps.event.addDomListener(window, 'resize', onWindowResize);
        }

        function loadShipment(shipmentId) {
            var promise = ShipmentListService.getShipmentListItem(shipmentId).$promise;
            $rootScope.loading = true;
            promise.then(
                function (result) {
                    $rootScope.loading = false;
                    $state.current.data.subTitle = result.referenceNumber;
                    vm.shipment = result;
                },
                function (error) {
                    $rootScope.loading = false;
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            );
        }
        
        function loadShipmentStops(shipmentId) {
            vm.stopMarkers = [];
            
            var promise = ShipmentsService.getStops(shipmentId).$promise;
            promise.then(
                function (result) {
                    var stopType = 'origin';
                    _.forEach(result, function (stop) {
                        stopType = 'origin';
                        if (stop.destinationId > 1) {
                            if (stop.destinationId === result.length)
                                stopType = stop.hasArrived ? 'destination-arrived' : 'destination';
                            else
                                stopType = stop.hasArrived ? 'stop-arrived' : 'stop';
                        }

                        var marker = angular.extend(
                            new google.maps.Marker({
                                id: stop.destinationId,
                                icon: MapsConstants.icons.stops.default,
                                zIndex: markerZIndices.stop,
                                position: {
                                    lat: stop.addressLatitude,
                                    lng: stop.addressLongitude
                                },
                                map: vm.map
                            }),
                            {
                                stop: stop,
                                stopType: stopType
                            }
                        );

                        if (stop.shipmentStopRadialGeofence) {
                            var meters = 0;
                            switch (stop.shipmentStopRadialGeofence.radiusUnitType.toLowerCase()) {
                                case 'miles':
                                    meters = UomDistanceConverter.milesToMeters(stop.shipmentStopRadialGeofence.radius, 'round');
                                    break;
                                case 'feet':
                                    meters = UomDistanceConverter.feetToMeters(stop.shipmentStopRadialGeofence.radius, 'round');
                                    break;
                                case 'kilometers':
                                    meters = UomDistanceConverter.kilometersToMeters(stop.shipmentStopRadialGeofence.radius, 'round');
                                    break;
                            }

                            var radialStop = new google.maps.Circle({
                                center: new google.maps.LatLng(stop.shipmentStopRadialGeofence.latitudeCenter, stop.shipmentStopRadialGeofence.longitudeCenter),
                                radius: meters,
                                strokeColor: vm.mapShapeStyles.shipmentStop.strokeColor,
                                strokeOpacity: vm.mapShapeStyles.shipmentStop.strokeOpacity,
                                strokeWeight: vm.mapShapeStyles.shipmentStop.strokeWeight,
                                fillColor: vm.mapShapeStyles.shipmentStop.fillColor,
                                fillOpacity: vm.mapShapeStyles.shipmentStop.fillOpacity,
                                editable: false,
                                map: vm.map
                            });
                        }
                        else {
                            var polygonStop = new google.maps.Polygon({
                                paths: getPolygonCoordinates(stop.shipmentStopPolygonGeofence),
                                strokeColor: vm.mapShapeStyles.shipmentStop.strokeColor,
                                strokeOpacity: vm.mapShapeStyles.shipmentStop.strokeOpacity,
                                strokeWeight: vm.mapShapeStyles.shipmentStop.strokeWeight,
                                fillColor: vm.mapShapeStyles.shipmentStop.fillColor,
                                fillOpacity: vm.mapShapeStyles.shipmentStop.fillOpacity,
                                editable: false,
                                map: vm.map
                            });
                        }

                        setStopMarkerIcon(marker);
                        addStopMarkerListeners(marker);
                        vm.stopMarkers.push(marker);
                    });
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function onFilterChange() {
            _.forEach(vm.reportMarkers, function(marker) {
                marker.setVisible(vm.filterService.filter(marker.report));
            });

            if (vm.selectedReportMarker && !vm.filterService.filter(vm.selectedReportMarker.report)) {
                selectReport(null);
            }
        }

        function onReportMarkerClick(marker) {
            if (vm.selectedStopMarker) {
                vm.selectedStopMarker.setMap(null);
                vm.selectedStopMarker = null;
            }
            vm.reportsService.selected = vm.reportsService.selected === marker.report ? null : marker.report;
        }

        function onStopMarkerClick(marker) {
            if (vm.reportsService.selected) {
                selectReport(null);
            }

            if (vm.selectedStopMarker) {
                vm.selectedStopMarker.setMap(null);
                vm.selectedStopMarker = null;
            }

            if (marker.stopType.indexOf('selected') > -1) {
                return;
            }

            vm.selectedStopMarker = angular.extend(
                new google.maps.Marker({
                    id: stop.destinationId,
                    icon: MapsConstants.icons.stops.default,
                    zIndex: markerZIndices.selected,
                    position: marker.getPosition(),
                    map: vm.map
                }),
                {
                    stop: marker.stop,
                    stopType: marker.stopType + '-selected'
                }
            );

            setStopMarkerIcon(vm.selectedStopMarker);
            addStopMarkerListeners(vm.selectedStopMarker);
        }

        function onReportsChange(reports) {
            clearMarkers();
            clearPolyline();

            var bounds = new google.maps.LatLngBounds();

            _.forEach(reports, function(report) {
                if (report.latitude !== null && report.longitude !== null) {
                    var strLocationMethod = $filter('locationMethod')(report.locationMethod, report.latitude, report.longitude);
                    var zIndexName = report.severity.toLowerCase() + '-' + strLocationMethod.toLowerCase();
                    var marker = angular.extend(
                        new google.maps.Marker({
                            id: report.reportGuid,
                            icon: MapsConstants.icons.deviceReports.normal.default,
                            zIndex: markerZIndices[zIndexName],
                            position: {
                                lat: report.latitude,
                                lng: report.longitude
                            },
                            map: vm.map,
                            visible: vm.filterService.filter(report)
                        }),
                        {
                            report: report
                        }
                    );
                    setReportMarkerIcon(marker);
                    addReportMarkerListeners(marker);
                    vm.reportMarkers.push(marker);

                    if (report.latitude !== 0 || report.longitude !== 0) {
                        var latlng = new google.maps.LatLng(report.latitude, report.longitude);
                        bounds.extend(latlng);
                    }
                }
            });

            if (reports.length == 1 && vm.reportMarkers.length>0 ) {
                // set center of map
                vm.map.setCenter(bounds.getCenter());
                vm.map.setZoom(16);
            } else if (reports.length > 1 && vm.reportMarkers.length>0 ) {
                // fit to bounds
                vm.map.fitBounds(bounds);
            } else {
                vm.map.setZoom(0);
            }

            var polylineCoordinates = [];
            _.forEach(vm.reportMarkers, function(marker) {
                polylineCoordinates.push(marker.getPosition());
            });
            vm.polyline = new google.maps.Polyline({
                clickable: false,
                path: polylineCoordinates,
                geodesic: false,
                strokeColor: '#00ffc8',
                strokeOpacity: 0.8,
                strokeWeight: 3,
                zIndex: 2,
                map: vm.map
            });
            vm.polylineBg = new google.maps.Polyline({
                clickable: false,
                path: polylineCoordinates,
                geodesic: false,
                strokeColor: '#000000',
                strokeOpacity: 0.6,
                strokeWeight: 5,
                zIndex: 1,
                map: vm.map
            });
        }

        function onSelectedReportChange(report) {
            if (vm.selectedReportMarker) {
                vm.selectedReportMarker.setMap(null);
                vm.selectedReportMarker = null;
                vm.selectedIndex = null;
            }

            if (!report) {
                return;
            }

            var index = _.findIndex(vm.reportsService.reports, function(r) {
                return r.reportGuid === report.reportGuid;
            });

            vm.selectedIndex = index;
            vm.nextReport = index === 0 ? null : findNextVisible(index);
            vm.previousReport = index === vm.reportsService.reports.length - 1 ? null : findPrevVisible(index);

            if (!report.latitude || !report.longitude) {
                return;
            }

            var strLocationMethod = $filter('locationMethod')(report.locationMethod, report.latitude, report.longitude);
            var iconName = '../img/' + report.severity + '-' + strLocationMethod.toLowerCase() + '-selected.png';
            vm.selectedReportMarker = new google.maps.Marker({
                id: 'selected',
                icon: {
                    url: iconName,
                    anchor: {x: 11, y: 11},
                    scaledSize: { height: 24, width: 24}
                },
                zIndex: markerZIndices.selected,
                position: {
                    lat: report.latitude,
                    lng: report.longitude
                },
                map: vm.map
            });
            addReportMarkerListeners(vm.selectedReportMarker);
            vm.selectedReportMarker.report = report;


        }

        function findNextVisible(selectedIndex) {
            for(var i = selectedIndex - 1; i >= 0; i--) {
                if (vm.filterService.filter(vm.reportsService.reports[i])) {
                    return vm.reportsService.reports[i];
                }
            }
            return null;
        }

        function findPrevVisible(selectedIndex) {
            for(var i = selectedIndex + 1; i <= vm.reportsService.reports.length - 1; i++) {
                if (vm.filterService.filter(vm.reportsService.reports[i])) {
                    return vm.reportsService.reports[i];
                }
            }
            return null;
        }

        function onMapClick() {
            if (vm.reportsService.selected) {
                vm.reportsService.selected = null;
                $scope.$apply();
            }
        }

        function onWindowResize() {
            if ($state.current.name !== 'shipment.map') {
                return;
            }

            var center = vm.map.getCenter();

            var newHeight = window.innerHeight * 0.60;
            var mapDiv = document.getElementById(googleMapDivId);
            mapDiv.style.height = Math.round(newHeight) + 'px';

            var mapItemListDiv = document.getElementById('map-items-list');
            mapItemListDiv.style.height = (Math.round(newHeight) + 172) + 'px';

            google.maps.event.trigger(vm.map, 'resize');
            vm.map.setCenter(center);
        }

        function panToReports() {

            if (vm.reportMarkers.length === 0) {
                panToStops();
                return;
            }

            var latLngBounds = new google.maps.LatLngBounds();
            _.forEach(vm.reportMarkers, function (marker) {
                latLngBounds.extend(marker.getPosition());
            });
            vm.map.fitBounds(latLngBounds);
        }

        function panToReportMarker(marker) {
            vm.map.panTo(marker.getPosition());
            vm.map.setZoom(11);
            $('#btn-details-center-map').blur();
        }

        function panToStop() {
            if (vm.selectedStopMarker) {
                vm.map.panTo(vm.selectedStopMarker.getPosition());
                vm.map.setZoom(11);
            }
            $('#btn-details-shipment-center-map').blur();
        }

        function panToStops() {

            var latLngBounds = new google.maps.LatLngBounds();
            _.forEach(vm.stopMarkers, function (marker) {
                latLngBounds.extend(marker.getPosition());
            });
            vm.map.fitBounds(latLngBounds);
        }


        function setReportMarkerIcon(marker) {
            if (!marker || !marker.report) {
                return;
            }

            var strLocationMethod = $filter('locationMethod')(marker.report.locationMethod, marker.report.latitude, marker.report.longitude);
            var iconName = '../img/' + marker.report.severity + '-' + strLocationMethod.toLowerCase() + '.png';

            var iconOptions = {
                url: iconName,
                anchor: {x: 11, y: 11},
                scaledSize: { height: 24, width: 24}
            };
            marker.setIcon(iconOptions);
        }

        function setStopMarkerIcon(marker) {
            if (!marker) {
                return;
            }

            var iconName = '../img/' + marker.stopType  + '.png';
            var iconOptions = {
                url: iconName,
                anchor: {x: 23, y: 23}
            };
            marker.setIcon(iconOptions);
        }

        function setType(mapType) {
            vm.mapType = mapType;
            vm.map.setMapTypeId(mapType.type);
        }

        function selectReport(report) {
            vm.reportsService.selected = vm.reportsService.selected === report ? null : report;
            $('#btn-details-select-prev').blur();
            $('#btn-details-select-next').blur();
        }

    }
})();