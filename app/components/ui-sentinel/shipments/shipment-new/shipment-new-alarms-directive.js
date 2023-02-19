(function () {
    'use strict';

    angular
        .module('ui-sentinel.shipments.shipmentNew')
        .directive('shipmentNewAlarms', ShipmentNewAlarmsDirective);

    function ShipmentNewAlarmsDirective() {
        var directive = {
            restrict: 'A',
            scope: {
                device: '=',
                alarms: '='
            },
            controller: ThisDirectiveController,
            controllerAs: 'shipmentNewAlarms',
            bindToController: true,
            templateUrl: 'ui-sentinel-shipments.shipmentNew/shipment-new-alarms-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
            scope.$watch(
                function(scope) {
                    return scope.shipmentNewAlarms.device;
                },
                function (device) {
                    controller.load();
                }, true
            );

        }

    }

    ThisDirectiveController.$inject = ['$rootScope', '$state', 'DevicesService', 'AlarmsService', 'SentinelUiSession', 'FeedbackService'];
    function ThisDirectiveController($rootScope, $state, DevicesService, AlarmsService, SentinelUiSession, FeedbackService) {
        var vm = {
            feedback: FeedbackService,
            actions: {
                toggleAlarm: toggleAlarm,
                goToAlarm: goToAlarm
            },
            load: load
        };
        activate();
        return vm;

        function activate() {
        }

        function goToAlarm(alarmId) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('alarm.admin', { alarmId: alarmId, referrer: returnState, referrerParams: returnStateParams } );
        }

        function load() {
            vm.alarms = [];
            if (!vm.device) {
                return;
            }

            var promise = (SentinelUiSession.user.isAnAdmin && (SentinelUiSession.user.accountId==SentinelUiSession.focus.id))?
             AlarmsService.getAlarms(SentinelUiSession.focus).$promise:AlarmsService.getAlarmsAccount(SentinelUiSession.focus).$promise;
             $rootScope.loading = true;
             promise.then(
                function(result) {
                    $rootScope.loading = false;
                    _.forEach(result, function (alarm) {
                        //TODO check if is it necesary the filter or not
                        if (alarm.alarmType!="device") {
                            vm.alarms.push(angular.extend(alarm, { isAdded: false }));
                        }
                    });
                    //loadAssigned();   //skipping this feature until templates include preselected alarms
                },
                function (error) {
                    $rootScope.loading = false;
                  vm.feedback.addError(error.data.message);
                }
            );
        }

        function loadAssigned() {
            if (!vm.device) {
                return;
            }

            var promise = DevicesService.getAlarms(vm.device).$promise;
            promise.then(
                function(result) {
                    _.forEach(result, function(assignedAlarm) {
                        _.forEach(vm.alarms, function(availableAlarm) {
                            if (assignedAlarm.alarmId === availableAlarm.alarmId) {
                                availableAlarm.isAdded = true;
                            }
                        });
                    });
                },
                function (error) {
                   vm.feedback.addError(error.data.message);
                }
            );
        }

        function toggleAlarm(alarm) {
            if (vm.device === null) {
                vm.feedback.addError('A tracking device is required to assign alarms');
                return;
            }

            $('#btn-toggle-alarm-' + alarm.alarmId).blur();
            alarm.isAdded = !alarm.isAdded;
        }
    }

})();