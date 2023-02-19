(function () {
    'use strict';

    angular
        .module('tracking.ui.shipments.map')
        .directive('shipmentsMapTimeline', ShipmentsMapTimelineDirective);

    function ShipmentsMapTimelineDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'shipmentsMapTimeline',
            templateUrl: 'tracking-ui-shipments-map/shipments-map-timeline-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
        }
    }

    ThisDirectiveController.$inject = ['$rootScope', '$scope', 'localStorageService', 'ShipmentsService', 'ShipmentsFilterService'];
    function ThisDirectiveController($rootScope, $scope, localStorageService, ShipmentsService, ShipmentsFilterService) {

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
            'warning-network-selected': 17
        };

        var vm = {
            container: null,
            timeline: null,
            dataSet: new vis.DataSet({}),
            filterService: ShipmentsFilterService,
            shipmentsService: ShipmentsService,
            selectedItem: null,
            options: {
                width: '100%',
                height: '160px',
                orientation: 'top',
                sort: false,
                sampling: false,
                style: 'points',
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
                            text: ShipmentsFilterService.filterByPropertyName
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
                    id:  groupIds['ok-anchor'],
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
                    id:  groupIds['info-anchor'],
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
                    id:  groupIds['warning-anchor'],
                    content: 'Warn - Anchor',
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
                    id: groupIds['warning-anchor-selected'],
                    content: 'Warn - Anchor - Selected',
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
            moveToAll: moveToAll,
            moveToShipment: moveToShipment,
            moveToCurrentDay: moveToCurrentDay,
            moveToCurrentWeek: moveToCurrentWeek,
            moveToCurrentMonth: moveToCurrentMonth
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////


        function activate() {
            vm.container = document.getElementById('shipmentsMapTimeline');

            var timelineRange = localStorageService.get('timelineRange');
            if (timelineRange) {
                vm.options.start = timelineRange.start;
                vm.options.end = timelineRange.end;
            }
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
                    if ($rootScope.$state.current.name !== 'shipments.map') {
                        return;
                    }

                    onFilterChange();
                }, true
            );
            $scope.$watch(
                function() {
                    return vm.shipmentsService.selected;
                },
                function (report) {
                    onSelectedReportChange(report);
                }, true
            );
            $scope.$watchCollection(
                function() {
                    return vm.shipmentsService.shipments;
                },
                function (reports) {
                    onReportsChange(reports);
                }
            );
        }

        function addItems(shipments) {
            var items = [];
            _.forEach(shipments, function(shipment) {


                var groupIdName = 'ok-' + (!shipment.latestReport || !shipment.latestReport.locationMethod ? 'none' : (shipment.latestReport.locationMethod.toLowerCase() === 'anchor' ? 'anchor' :shipment.latestReport.locationMethod.toLowerCase() === 'gps' ? 'gps' : 'network'));
                var item = {
                    id: shipment.shipmentId,
                    x: moment(!shipment.latestReport ? shipment.startDate :  shipment.latestReport.messageTimeStamp).local().toDate().valueOf(),
                    y: (typeof shipment.latestReport[vm.filterService.range.property] === 'undefined' || shipment.latestReport[vm.filterService.range.property] === null) ? vm.filterService.range.min : shipment.latestReport[vm.filterService.range.property],
                    group: groupIds[groupIdName]
                };

                if (vm.filterService.filter(shipment)) {
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
                            17: vm.filterService.showWarning
                        }
                    }
                }
            );
        }

        function onFilterChange() {
            vm.filterService.save();
            addItems(vm.shipmentsService.shipments);
            adjustTimelineScale();
            if (vm.shipmentsService.selected) {
                onSelectedReportChange(vm.shipmentsService.selected);
            }
        }

        function onEvent(props) {
            var firstTarget = props.event.firstTarget;

            if (firstTarget.nodeName === 'image') {
                vm.shipmentsService.selected = vm.shipmentsService.selected && vm.shipmentsService.selected.shipmentId === firstTarget.id ? null : vm.shipmentsService.get(firstTarget.id);
            }
            else {
                vm.shipmentsService.selected = null;
            }
            $scope.$apply();
        }

        function onRangeChange() {

            // if (onRangeTimeout) {
            //     window.clearTimeout(onRangeTimeout);
            // }
            // onRangeTimeout = window.setTimeout(
            //     function() {
            //         var timelineRange = vm.timeline.getWindow();
            //         localStorageService.set('timelineRange', timelineRange);
            //         vm.shipmentsService.reload();
            //
            //         $scope.$apply();
            //     }, 500
            // );
        }

        function onReportsChange() {
            addItems(vm.shipmentsService.shipments);
            adjustTimelineScale();
            moveToAll();
        }

        function onSelectedReportChange(shipment) {
            if (vm.selectedItem) {
                vm.dataSet.remove('selected');
                vm.selectedItem = null;
            }

            if (!shipment) {
                return;
            }

            var groupIdName = 'ok-' + (!shipment.latestReport || !shipment.latestReport.locationMethod ? 'none' : (shipment.latestReport.locationMethod.toLowerCase() === 'anchor' ? 'anchor' : shipment.latestReport.locationMethod.toLowerCase() === 'gps' ? 'gps' : 'network')) + '-selected';
            vm.selectedItem = {
                id: 'selected',
                group: groupIds[groupIdName],
                x: moment(!shipment.latestReport ? shipment.startDate : shipment.latestReport.messageTimeStamp).local().toDate().valueOf(),
                y: (typeof shipment.latestReport[vm.filterService.range.property] === 'undefined' || shipment.latestReport[vm.filterService.range.property] === null) ? vm.filterService.range.min : shipment.latestReport[vm.filterService.range.property],
            };
            vm.dataSet.add(vm.selectedItem);

            shipment.centerOnTimeline = function() {
                moveToShipment(shipment);
            };
        }

        function moveToAll() {
            var startDate;
            var endDate;

            _.forEach(vm.shipmentsService.shipments, function (shipment) {
                if (!startDate) {
                    startDate = moment(shipment.latestReport.messageTimeStamp);
                }
                else {
                    var tempStart = moment(shipment.latestReport.messageTimeStamp);
                    startDate = tempStart.isBefore(startDate) ? tempStart : startDate;
                }
            });

            _.forEach(vm.shipmentsService.shipments, function (shipment) {
                if (!endDate) {
                    endDate = moment(shipment.latestReport.messageTimeStamp);
                }
                else {
                    var tempEnd = moment(shipment.latestReport.messageTimeStamp);
                    endDate = tempEnd.isAfter(endDate) ? tempEnd : endDate;
                }
            });

            if (!startDate || !endDate) {
                return;
            }

            vm.timeline.setWindow(startDate.local().startOf('day'), endDate.local().endOf('day'));
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

        function moveToShipment(shipment) {
            if (shipment) {
                vm.timeline.moveTo(moment(!shipment.latestReport ? shipment.startDate : shipment.latestReport.messageTimeStamp).local().toDate().valueOf());
            }
        }
    }

})();