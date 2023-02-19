(function () {
    'use strict';

    angular
        .module('ui-sentinel.devices.deviceTracking')
        .directive('deviceTrackingTimeline', DeviceTrackingTimelineDirective);

    function DeviceTrackingTimelineDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'deviceTrackingTimeline',
            templateUrl: 'ui-sentinel-devices.deviceTracking/device-tracking-timeline-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
        }
    }

    ThisDirectiveController.$inject = ['$rootScope', '$scope','$filter', 'DeviceTrackingReportsService', 'DeviceTrackingFilterService'];
    function ThisDirectiveController($rootScope, $scope,$filter, DeviceTrackingReportsService, DeviceTrackingFilterService) {
        var timelineDivId = "deviceTrackingTimeline";
        var onRangeTimeout = null;

        var vm = {
            container: null,
            timeline: null,
            dataSet: new vis.DataSet({}),
            filterService: DeviceTrackingFilterService,
            reportsService: DeviceTrackingReportsService,
            selectedItem: null,
            hasLastReport: false,
            options: {
                width: '100%',
                height: '160px',
                orientation: 'top',
                sort: false,
                sampling: false,
                min: moment().subtract(1, 'year'),
                max: moment().add(2, 'day'),
                start: moment().subtract(45, 'day'),
                end: moment().add(2, 'day'),
                zoomMax: 1 * 45 * 24 * 60 * 60 * 1000,
                zoomMin: 1 * 1 * 1 * 60 * 15 * 1000,
                showCurrentTime: false,
                dataAxis: {
                    left: {
                        title: {
                            text: DeviceTrackingFilterService.filterByPropertyName
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
                    id:  'ok-anchor',
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
                    id:  'info-none',
                    content: 'Info - No Location',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 32,
                            style: 'image',
                            imageUrl: '../img/info-none.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id:  'info-network',
                    content: 'Info - Network',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 24,
                            style: 'image',
                            imageUrl: '../img/info-network.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id:  'info-gps',
                    content: 'Info - Gps',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 24,
                            style: 'image',
                            imageUrl: '../img/info-gps.png'
                        }
                    },
                    className: 'timeline-report'
                },
                 {
                    id:  'info-anchor',
                    content: 'Info - Anchor',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 24,
                            style: 'image',
                            imageUrl: '../img/info-anchor.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id:  'warning-none',
                    content: 'Warn - No Location',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 32,
                            style: 'image',
                            imageUrl: '../img/warning-none.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id:  'warning-network',
                    content: 'Warn - Network',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 24,
                            style: 'image',
                            imageUrl: '../img/warning-network.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id:  'warning-gps',
                    content: 'Warn - Gps',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 24,
                            style: 'image',
                            imageUrl: '../img/warning-gps.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id:  'warning-anchor',
                    content: 'Warn - anchor',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 24,
                            style: 'image',
                            imageUrl: '../img/warning-anchor.png'
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
                },
                {
                    id: 'info-none-selected',
                    content: 'Info - No Location - Selected',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 32,
                            style: 'image',
                            imageUrl: '../img/info-none-selected.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id: 'info-network-selected',
                    content: 'Info - Network - Selected',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 24,
                            style: 'image',
                            imageUrl: '../img/info-network-selected.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id: 'info-gps-selected',
                    content: 'Info - Gps - Selected',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 24,
                            style: 'image',
                            imageUrl: '../img/info-gps-selected.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id: 'info-anchor-selected',
                    content: 'Info - Anchor - Selected',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 24,
                            style: 'image',
                            imageUrl: '../img/info-anchor-selected.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id: 'warning-none-selected',
                    content: 'Warn - No Location - Selected',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 32,
                            style: 'image',
                            imageUrl: '../img/warning-none-selected.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id: 'warning-network-selected',
                    content: 'Warn - Network - Selected',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 24,
                            style: 'image',
                            imageUrl: '../img/warning-network-selected.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id: 'warning-gps-selected',
                    content: 'Warn - Gps - Selected',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 24,
                            style: 'image',
                            imageUrl: '../img/warning-gps-selected.png'
                        }
                    },
                    className: 'timeline-report'
                },
                {
                    id: 'warning-anchor-selected',
                    content: 'Warn - Anchor - Selected',
                    options: {
                        style: 'points',
                        drawPoints: {
                            enabled: true,
                            size: 24,
                            style: 'image',
                            imageUrl: '../img/warning-anchor-selected.png'
                        }
                    },
                    className: 'timeline-report'
                }
            ],
            onFilterChange: onFilterChange,
            onReportsChange: onReportsChange,
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
            vm.container = document.getElementById(timelineDivId);
            vm.options.start = vm.reportsService.fromDate;
            vm.options.end = vm.reportsService.toDate;
            vm.timeline = new vis.Graph2d(vm.container, vm.dataSet, vm.groups, vm.options);
            onFilterChange();
            vm.timeline.fit();

            vm.timeline.on('select', onEvent);
            vm.timeline.on('click', onEvent);
            vm.timeline.on('rangechanged', onRangeChange);

            $scope.$watch(
                function() {
                    return vm.filterService;
                },
                function () {
                    if ($rootScope.$state.current.name !== 'device.map') {
                        return;
                    }

                    onFilterChange();
                }, true
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
                    return vm.reportsService.lastReport;
                },
                function (report) {
                    vm.hasLastReport = true && report;
                }, true
            );
            $scope.$watchCollection(
                function() {
                    return vm.reportsService.reports;
                },
                function (reports) {
                    onReportsChange(reports);
                }
            );
        }

        function addItems(reports) {
            var items = [];
            _.forEach(reports, function(report) {
                var strLocationMethod = $filter('locationMethod')(report.locationMethod, report.latitude, report.longitude);
                var groupIdName = report.severity.toLowerCase() + '-' + strLocationMethod.toLowerCase();
                items.push({
                    id: 'line-' + report.guid,
                    x: moment(report.messageTimeStamp).local().toDate().valueOf(),
                    y: (typeof report[vm.filterService.range.property] === 'undefined' || report[vm.filterService.range.property] === null) ? vm.filterService.range.min : report[vm.filterService.range.property],
                    group: 'line'
                });
                if (vm.filterService.filter(report)) {
                    items.push({
                        id: report.guid,
                        x: moment(report.messageTimeStamp).local().toDate().valueOf(),
                        y: (typeof report[vm.filterService.range.property] === 'undefined' || report[vm.filterService.range.property] === null) ? vm.filterService.range.min : report[vm.filterService.range.property],
                        group: groupIdName,
                        sightings: report.countOfSightings,
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
                                text: vm.filterService.filterByPropertyName
                            },
                            range: {
                                min: scale.min,
                                max: scale.max
                            },
                            format: function (value) {
                                return '' + Math.round(value);
                            }
                        }
                    },
                    groups: {
                        visibility: {
                            'line': true,
                            'ok-none': vm.filterService.showOk,
                            'ok-gps': vm.filterService.showOk,
                            'ok-network': vm.filterService.showOk,
                            'info-none': vm.filterService.showInfo,
                            'info-gps': vm.filterService.showInfo,
                            'info-network': vm.filterService.showInfo,
                            'warning-none': vm.filterService.showWarning,
                            'warning-gps': vm.filterService.showWarning,
                            'warning-network': vm.filterService.showWarning,
                            'ok-none-selected': vm.filterService.showOk,
                            'ok-gps-selected': vm.filterService.showOk,
                            'ok-network-selected': vm.filterService.showOk,
                            'info-none-selected': vm.filterService.showInfo,
                            'info-gps-selected': vm.filterService.showInfo,
                            'info-network-selected': vm.filterService.showInfo,
                            'warning-none-selected': vm.filterService.showWarning,
                            'warning-gps-selected': vm.filterService.showWarning,
                            'warning-network-selected': vm.filterService.showWarning
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
                vm.reportsService.selected = vm.reportsService.selected && vm.reportsService.selected.guid === firstTarget.id ? null : vm.reportsService.get(firstTarget.id);
            }
            else {
                vm.reportsService.selected = null;
            }
            $scope.$apply();
        }

        function onRangeChange() {
            if(vm.reportsService.isLoading) {
                window.setTimeout(onRangeChange(), 500);
            } else {
                var timelineWindow = vm.timeline.getWindow();
                if (vm.reportsService.fromDate.isSame(timelineWindow.start) && vm.reportsService.toDate.isSame(timelineWindow.end) ) {
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
        }

        function onReportsChange() {
            var timelineWindow = vm.timeline.getWindow();

            if (!vm.reportsService.fromDate.isSame(timelineWindow.start) || !vm.reportsService.toDate.isSame(timelineWindow.end) ) {
                vm.timeline.setWindow(moment(vm.reportsService.fromDate), moment(vm.reportsService.toDate));
            }

            addItems(vm.reportsService.reports);
            adjustTimelineScale();
        }

        function onSelectedReportChange(report) {
            if (vm.selectedItem) {
                vm.dataSet.remove('selected');
                vm.selectedItem = null;
            }

            if (!report) {
                return;
            }

            var strLocationMethod = $filter('locationMethod')(report.locationMethod, report.latitude, report.longitude);
            var groupIdName = report.severity.toLowerCase() + '-' + strLocationMethod.toLowerCase() + '-selected';
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