(function () {
    'use strict';

    angular
        .module('ui-sentinel.devices.latestDeviceTracking')
        .directive('latestDeviceTrackingTimeline', LatestDeviceTrackingTimelineDirective);

    function LatestDeviceTrackingTimelineDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'latestDeviceTrackingTimeline',
            templateUrl: 'ui-sentinel-devices.latestDeviceTracking/latest-device-tracking-timeline-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
        }
    }

    ThisDirectiveController.$inject = ['$rootScope', '$scope','$filter','LatestDeviceTrackingReportsService', 'LatestDeviceTrackingFilterService'];
    function ThisDirectiveController($rootScope, $scope, $filter, LatestDeviceTrackingReportsService, LatestDeviceTrackingFilterService) {
        var timelineDivId = "latestDeviceTrackingTimeline";
        var onRangeTimeout = null;

        var groupIds = {
            'ok-none': 0,
            'ok-gps': 1,
            'ok-network': 2,
            'info-none': 3,
            'info-gps': 4,
            'info-network': 5,
            'warning-none': 6,
            'warning-gps': 7,
            'warning-network': 8,
            'ok-none-selected': 9,
            'ok-gps-selected': 10,
            'ok-network-selected': 11,
            'info-none-selected': 12,
            'info-gps-selected': 13,
            'info-network-selected': 14,
            'warning-none-selected': 15,
            'warning-gps-selected': 16,
            'warning-network-selected': 17,
            'ok-anchor': 18,
            'info-anchor': 19,
            'warning-anchor': 20,
            'ok-anchor-selected': 21,
            'info-anchor-selected': 22,
            'warning-anchor-selected': 23,
        };

        var vm = {
            container: null,
            timeline: null,
            dataSet: new vis.DataSet({}),
            filterService: LatestDeviceTrackingFilterService,
            reportsService: LatestDeviceTrackingReportsService,
            selectedItem: null,
            options: {
                width: '100%',
                height: '160px',
                orientation: 'top',
                sort: false,
                sampling: false,
                style: 'points',
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
                            text: LatestDeviceTrackingFilterService.filterByPropertyName
                        }
                    }
                }
            },
            groups: [
                {
                    id: groupIds['ok-none'],
                    content: 'Ok - No Location',
                    options: {
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
                    id:  groupIds['ok-network'],
                    content: 'Ok - Network',
                    options: {
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
                    id:  groupIds['ok-gps'],
                    content: 'Ok - Gps',
                    options: {
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
                    id:  groupIds['info-none'],
                    content: 'Info - No Location',
                    options: {
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
                    id:  groupIds['info-network'],
                    content: 'Info - Network',
                    options: {
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
                    id:  groupIds['info-gps'],
                    content: 'Info - Gps',
                    options: {
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
                    id:  groupIds['warning-none'],
                    content: 'Warn - No Location',
                    options: {
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
                    id:  groupIds['warning-network'],
                    content: 'Warn - Network',
                    options: {
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
                    id:  groupIds['warning-gps'],
                    content: 'Warn - Gps',
                    options: {
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
                    id:  groupIds['ok-none-selected'],
                    content: 'Ok - No Location - Selected',
                    options: {
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
                    id: groupIds['ok-network-selected'],
                    content: 'Ok - Network - Selected',
                    options: {
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
                    id: groupIds['ok-gps-selected'],
                    content: 'Ok - Gps - Selected',
                    options: {
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
                    id: groupIds['info-none-selected'],
                    content: 'Info - No Location - Selected',
                    options: {
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
                    id: groupIds['info-network-selected'],
                    content: 'Info - Network - Selected',
                    options: {
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
                    id: groupIds['info-gps-selected'],
                    content: 'Info - Gps - Selected',
                    options: {
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
                    id: groupIds['warning-none-selected'],
                    content: 'Warn - No Location - Selected',
                    options: {
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
                    id: groupIds['warning-network-selected'],
                    content: 'Warn - Network - Selected',
                    options: {
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
                    id: groupIds['warning-gps-selected'],
                    content: 'Warn - Gps - Selected',
                    options: {
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
                    id: groupIds['ok-anchor'],
                    content: 'Ok - Anchor',
                    options: {
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
                    id: groupIds['info-anchor'],
                    content: 'Info - Anchor',
                    options: {
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
                    id: groupIds['warning-anchor'],
                    content: 'Warning - Anchor',
                    options: {
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
                    id: groupIds['ok-anchor-selected'],
                    content: 'Ok - Anchor - Selected',
                    options: {
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
                    id: groupIds['info-anchor-selected'],
                    content: 'Info - Anchor - Selected',
                    options: {
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
                    id: groupIds['warning-anchor-selected'],
                    content: 'Warning - Anchor - Selected',
                    options: {
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
            moveToCurrentMonth: moveToCurrentMonth
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

            vm.timeline.on('select', onEvent);
            vm.timeline.on('click', onEvent);
            vm.timeline.on('rangechanged', onRangeChange);

            $scope.$watch(
                function() {
                    return vm.filterService;
                },
                function () {
                    if ($rootScope.$state.current.name !== 'devices.map') {
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
                if(report.beaconType=="Sentinel 100A" || report.beaconType=="Mobile SDK Anchor")
                    groupIdName = report.severity.toLowerCase() + '-anchor';

                var removeHere = (vm.filterService.range.property=="temperatureC" || 
                    vm.filterService.range.property=="temperatureF" || 
                    vm.filterService.range.property=="temperatureProbeC" || 
                    vm.filterService.range.property=="temperatureProbeF" ||
                     vm.filterService.range.property=="temperatureProbe2C" || 
                    vm.filterService.range.property=="temperatureProbe2F") && 
                         (typeof report[vm.filterService.range.property] === 'undefined' || 
                            report[vm.filterService.range.property] === null);
                
                var item = {
                    id: report.guid,
                    x: moment(report.messageTimeStamp).local().toDate().valueOf(),
                    y: (typeof report[vm.filterService.range.property] === 'undefined' || report[vm.filterService.range.property] === null) ? vm.filterService.range.min : report[vm.filterService.range.property],
                    group: groupIds[groupIdName],
                    sightings: report.totalSightingsCount,
                };

                if (vm.filterService.filter(report) && !removeHere) {
                    items.push(item);
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
                            0: vm.filterService.showOk,
                            1: vm.filterService.showOk,
                            2: vm.filterService.showOk,
                            3: vm.filterService.showInfo,
                            4: vm.filterService.showInfo,
                            5: vm.filterService.showInfo,
                            6: vm.filterService.showWarning,
                            7: vm.filterService.showWarning,
                            8: vm.filterService.showWarning,
                            9: vm.filterService.showOk,
                            10: vm.filterService.showOk,
                            11: vm.filterService.showOk,
                            12: vm.filterService.showInfo,
                            13: vm.filterService.showInfo,
                            14: vm.filterService.showInfo,
                            15: vm.filterService.showWarning,
                            16: vm.filterService.showWarning,
                            17: vm.filterService.showWarning,
                            18: vm.filterService.showOk,
                            19: vm.filterService.showInfo,
                            20: vm.filterService.showWarning,
                            21: vm.filterService.showOk,
                            22: vm.filterService.showInfo,
                            23: vm.filterService.showWarning
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
            console.log("onRangeChange",vm.reportsService.selected);
            var timelineWindow = vm.timeline.getWindow();
            if (vm.reportsService.fromDate.isSame(timelineWindow.start) && vm.reportsService.toDate.isSame(timelineWindow.end) ) {
                return;
            }

            if(vm.reportsService.selected != null)
                return;

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
            if(report.beaconType=="Sentinel 100A" || report.beaconType=="Mobile SDK Anchor")
                    groupIdName = report.severity.toLowerCase() + '-anchor-selected';

            vm.selectedItem = {
                id: 'selected',
                group: groupIds[groupIdName],
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

        function moveToReport(report) {
            if (report) {
                vm.timeline.moveTo(moment(report.messageTimeStamp).local().toDate().valueOf());
            }
        }
    }

})();