(function () {
    'use strict';

    angular
        .module('tracking.ui.shipment.map')
        .directive('shipmentMapTimeline', ShipmentMapTimelineDirective);

    function ShipmentMapTimelineDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'shipmentMapTimeline',
            templateUrl: 'tracking-ui-shipment-map/shipment-map-timeline-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
        }
    }

    ThisDirectiveController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'localStorageService', 'ShipmentService', 'ShipmentReportsService', 'ShipmentReportsFilterService'];
    function ThisDirectiveController($rootScope, $scope, $state, $stateParams, localStorageService, ShipmentService, ShipmentReportsService, ShipmentReportsFilterService) {
        var TIMELINE_DIV = 'shipmentMapTimeline';
        var onRangeTimeout = null;

        var vm = {
            container: null,
            shipment: null,
            timeline: null,
            dataSet: new vis.DataSet({}),
            filterService: ShipmentReportsFilterService,
            shipmentService: ShipmentService,
            reportsService: ShipmentReportsService,
            selectedItem: null,
            moveToAllOnReportsChange: true,
            options: {
                width: '100%',
                height: '160px',
                orientation: 'top',
                sort: false,
                sampling: false,
                min: moment().subtract(2, 'year'),
                max: moment().add(2, 'day'),
                start: moment().subtract(30, 'day'),
                end: moment().add(2, 'day'),
                zoomMax: 1 * 30 * 24 * 60 * 60 * 1000,
                zoomMin: 1 * 1 * 1 * 60 * 60 * 1000,
                showCurrentTime: false,
                dataAxis: {
                    left: {
                        title: {
                            text: ShipmentReportsFilterService.filterByPropertyName
                        }
                    }
                }
            },
            groups: [
                {
                    id: 'line',
                    options: {
                        drawPoints: {
                            enabled: false
                        }
                    },
                    className: 'timeline-graph-line'
                },
                {
                    id: 'ok-none',
                    content: 'Ok - No Location',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 32,
                            style: 'image',
                            imageUrl: '../img/ok-none.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id:  'ok-network',
                    content: 'Ok - Network',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 24,
                            style: 'image',
                            imageUrl: '../img/ok-network.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id:  'ok-gps',
                    content: 'Ok - Gps',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 24,
                            style: 'image',
                            imageUrl: '../img/ok-gps.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id:  'ok-none-selected',
                    content: 'Ok - No Location - Selected',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 32,
                            style: 'image',
                            imageUrl: '../img/ok-none-selected.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id: 'ok-network-selected',
                    content: 'Ok - Network - Selected',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 24,
                            style: 'image',
                            imageUrl: '../img/ok-network-selected.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id: 'ok-gps-selected',
                    content: 'Ok - Gps - Selected',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 24,
                            style: 'image',
                            imageUrl: '../img/ok-gps-selected.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id: 'ok-anchor',
                    content: 'Ok - Anchor',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 24,
                            style: 'image',
                            imageUrl: '../img/ok-anchor.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id: 'ok-anchor-selected',
                    content: 'Ok - Anchor - Selected',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 24,
                            style: 'image',
                            imageUrl: '../img/ok-anchor-selected.png'
                        }
                    },
                    className: 'timeline-report'
                }
            ],
            onFilterChange: onFilterChange,
            onReportsChange: onReportsChange,
            moveToAll: moveToAll,
            moveToReport: moveToReport,
            moveToCurrentDay: moveToCurrentDay,
            moveToCurrentWeek: moveToCurrentWeek,
            moveToCurrentMonth: moveToCurrentMonth,
            moveToLastReport: moveToLastReport
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////


        function activate() {
            vm.container = document.getElementById(TIMELINE_DIV);

            $scope.$watch(
                function() {
                    return vm.filterService;
                },
                function () {
                    if ($state.current.name !== 'shipment.map') {
                        return;
                    }

                    onFilterChange();
                }, true
            );
            $scope.$watch(
                function() {
                    return vm.shipmentService.shipment;
                },
                function (shipment) {
                    if ($state.current.name !== 'shipment.map') {
                        return;
                    }
                    onShipmentChange(shipment);
                }
            );
            $scope.$watch(
                function() {
                    return vm.reportsService.selected;
                },
                function (report) {
                    if ($state.current.name !== 'shipment.map') {
                        return;
                    }
                    onSelectedReportChange(report);
                }, true
            );
            $scope.$watchCollection(
                function() {

                    return vm.reportsService.reports;
                },
                function (reports) {
                    if ($state.current.name !== 'shipment.map') {
                        return;
                    }
                    onReportsChange(reports);
                }
            );

            vm.timeline = new vis.Graph2d(vm.container, vm.dataSet, vm.groups, vm.options);

            vm.timeline.on('select', onEvent);
            vm.timeline.on('click', onEvent);
            vm.timeline.on('rangechanged', onRangeChange);
        }

        function addItems(reports) {
            var items = [];
            _.forEach(reports, function(report) {
                var groupIdName = 'ok-' + (!report.locationMethod ? 'none' : (report.locationMethod.toLowerCase() === 'anchor' ? 'anchor' :report.locationMethod.toLowerCase() === 'gps' ? 'gps' : 'network'));
                items.push({
                    id: 'line' + report.reportGuid,
                    x: moment(report.messageTimeStamp).local().toDate().valueOf(),
                    y: (typeof report[vm.filterService.range.property] === 'undefined' || report[vm.filterService.range.property] === null) ? vm.filterService.range.min : report[vm.filterService.range.property],
                    group: 'line'
                });

                if (vm.filterService.filter(report)) {
                    items.push({
                        id: report.reportGuid,
                        x: moment(report.messageTimeStamp).local().toDate().valueOf(),
                        y: (typeof report[vm.filterService.range.property] === 'undefined' || report[vm.filterService.range.property] === null) ? vm.filterService.range.min : report[vm.filterService.range.property],
                        group: groupIdName
                    });
                }
            });

            vm.dataSet.clear();
            vm.dataSet.add(items);
            if (vm.selectedItem) {
                vm.dataSet.add(vm.selectedItem);
            }
        }

        function adjustTimelineScale() {
            var values = [];
            _.forEach(vm.dataSet.get(), function(item) {
                values.push(item.y);
            });

            if (values.length === 0) {
                return;
            }

            var buffer = 10;

            var scale = {
                min: values.length > 0 ? Math.min.apply(null,values) - buffer : vm.filterService.range.min,
                max: values.length > 0 ? Math.max.apply(null, values) + buffer : vm.filterService.range.max
            };

            vm.timeline.setOptions(
                {
                    dataAxis: {
                        left: {
                            title: {
                                text: vm.filterService.filterByPropertyName + ' (' + vm.filterService.range.suffix + ')'
                            },
                            range: {
                                min: scale.min,
                                max: scale.max
                            },
                            format: function (value) {
                                return '' + Math.round(value);
                            }
                        }
                    }
                }
            );
        }

        function onFilterChange() {
            vm.filterService.save();
            addItems(vm.reportsService.reports);
            adjustTimelineScale();
            if (vm.reportsService.selected) {
                onSelectedReportChange(vm.reportsService.selected);
            }
        }

        function onEvent(props) {
            var firstTarget = props.event.firstTarget;

            if (firstTarget.nodeName === 'image') {
                vm.reportsService.selected = vm.reportsService.selected && vm.reportsService.selected.reportGuid === firstTarget.id ? null : vm.reportsService.get(firstTarget.id);
            }
            else {
                vm.reportsService.selected = null;
            }
            $scope.$apply();
        }

        function onRangeChange() {
            var timelineWindow = vm.timeline.getWindow();
            if (vm.reportsService.fromDate.isSame(timelineWindow.start) && vm.reportsService.toDate.isSame(timelineWindow.end) ) {
                return;
            }

            if (vm.moveToAllOnReportsChange) {
                //ignore first change
                return;
            }

            if (onRangeTimeout) {
                window.clearTimeout(onRangeTimeout);
            }
            onRangeTimeout = window.setTimeout(
                function() {
                    vm.reportsService.load(moment(timelineWindow.start), moment(timelineWindow.end));

                    $scope.$apply();
                }, 500
            );
        }

        function onReportsChange() {
            var timelineWindow = vm.timeline.getWindow();
            if (!vm.reportsService.fromDate.isSame(timelineWindow.start) || !vm.reportsService.toDate.isSame(timelineWindow.end) ) {
                vm.timeline.setWindow(moment(vm.reportsService.fromDate), moment(vm.reportsService.toDate));
            }

            addItems(vm.reportsService.reports);
            adjustTimelineScale();
            if (vm.moveToAllOnReportsChange) {
                moveToAll();
            }
            vm.moveToAllOnReportsChange = false;
        }

        function onSelectedReportChange(report) {
            if (vm.selectedItem) {
                vm.dataSet.remove('selected');
                vm.selectedItem = null;
            }

            if (!report) {
                return;
            }

            var groupIdName =  'ok-' + (!report.locationMethod ? 'none' : (report.locationMethod.toLowerCase() === 'anchor' ?'anchor':report.locationMethod.toLowerCase() === 'gps' ? 'gps' : 'network')) + '-selected';
            vm.selectedItem = {
                id: 'selected',
                group: groupIdName,
                x: moment(report.messageTimeStamp).local().toDate().valueOf(),
                y: (typeof report[vm.filterService.range.property] === 'undefined' || report[vm.filterService.range.property] === null) ? vm.filterService.range.min : report[vm.filterService.range.property],
            };
            vm.dataSet.add(vm.selectedItem);

            report.centerOnTimeline = function() {
                moveToReport(report);
            };
        }

        function onShipmentChange(shipment) {
            vm.shipment = shipment;
            if (!vm.shipment) {
                vm.shipmentId = null;
                vm.reportsService.clear();
                return;
            }
            vm.moveToAllOnReportsChange = true;
            vm.reportsService.init(vm.shipment.shipmentInfo.shipmentId);
        }

        function moveToAll() {
            vm.timeline.fit();
            $('#btn-timeline-all').blur();
        }

        function moveToCurrentDay() {
            vm.timeline.setWindow(moment().subtract(24, 'hour'), moment().endOf('day'));
            $('#btn-timeline-day').blur();
        }

        function moveToCurrentWeek() {
            vm.timeline.setWindow(moment().subtract(7, 'day').startOf('day'), moment().endOf('day'));
            $('#btn-timeline-week').blur();
        }

        function moveToCurrentMonth() {
            vm.timeline.setWindow(moment().subtract(1, 'month').startOf('day'), moment().endOf('day'));
            $('#btn-timeline-month').blur();
        }

        function moveToLastReport() {
            if (vm.reportsService.lastReport) {
                moveToReport(vm.reportsService.lastReport);
            }
            $('#btn-timeline-last').blur();
        }

        function moveToReport(report) {
            if (report) {
                vm.timeline.moveTo(moment(report.messageTimeStamp).local().toDate().valueOf());
            }
        }
    }

})();