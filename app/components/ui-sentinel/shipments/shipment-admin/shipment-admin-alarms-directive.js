(function () {
    'use strict';

    angular
        .module('ui-sentinel.shipments.shipmentAdmin')
        .directive('shipmentAdminAlarms', ShipmentAdminAlarmsDirective);

    function ShipmentAdminAlarmsDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'shipmentAdminAlarms',
            templateUrl: 'ui-sentinel-shipments.shipmentAdmin/shipment-admin-alarms-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
            controller.editor = scope.shipmentAdmin.editor;

            scope.$watch(
                function(scope) {
                    return scope.shipmentAdmin.editor.shipmentDevice;
                },
                function (newValue, oldValue) {
                    controller.device = newValue;
                }, true
            );

            scope.$watch(
                function(scope) {
                    return scope.shipmentAdmin.editor.sentinels;
                },
                function (newValue, oldValue) {
                    console.log(newValue);
                    controller.sentinels = newValue;
                }, true
            );
        }        
    }

    ThisDirectiveController.$inject = ['$rootScope', '$state', 'DevicesService', 'AlarmsService', 'SentinelUiSession', 'FeedbackService'];
    function ThisDirectiveController($rootScope, $state, DevicesService, AlarmsService, SentinelUiSession, FeedbackService) {
        var vm = {
            device: null,
            sentinels: [],
            assignedAlarms: [],
            availableAlarms: null,
            removableAlarms: null,
            editor: null,
            feedback: FeedbackService,
            panel: {
                isCollapsed: true,
                toggle: function () {
                    this.isCollapsed = !this.isCollapsed;
                    if (!this.isCollapsed) { load(); }
                }
            },
            mode: {
                isAdding: false,
                isRemoving: false
            },
            hasPermission: {
                toChange: false
            },
            actions: {
                beginAdd: beginAdd,
                beginRemove: beginRemove,
                endAdd: endAdd,
                endRemove: endRemove,
                addAlarm: addAlarm,
                removeAlarm: removeAlarm,
                goToAlarm: goToAlarm,
                reload: load
            }
        };
        activate();
        return vm;

        function activate() {
            setPermissions();
        }

        function addAlarm(alarm) {
            vm.feedback.clear();
            console.log(vm);
            $rootScope.loading = true;
            var promise = DevicesService.addAlarm(vm.device, alarm, vm.editor.shipment.shipmentInfo.shipmentId).$promise;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.assignedAlarms = _.remove(result, function (alarm) {
                        return alarm.isActiveOnShipmentOnly;
                    });
                    alarm.isAdded = true;
                    _.forEach(vm.sentinels,function(s){
                        var addPromise = DevicesService.addAlarmSentinel(s, alarm, vm.editor.shipment.shipmentInfo.shipmentId).$promise;
                        addPromise.then(
                            function (result) {
                                console.log("addAlarms",result);
                            },
                            function (error) { vm.feedback.addError('Could not add ' + alarm.alarmName); }
                        );
                    });
                },
                function (error) {
                    $rootScope.loading = false;
                   vm.feedback.addError(error.data.message);
                }
            );
        }

        function beginAdd() {
            vm.mode.isAdding = true;
            vm.availableAlarms = null;
            var promise = (SentinelUiSession.user.isAnAdmin && (SentinelUiSession.user.accountId==SentinelUiSession.focus.id))?
             AlarmsService.getAlarms(SentinelUiSession.focus).$promise:AlarmsService.getAlarmsAccount(SentinelUiSession.focus).$promise;
             $rootScope.loading = true;
             promise.then(
                function(result) {
                    $rootScope.loading = false;
                    var availableAlarms = [];
                    var shippingAlarms = _.remove(result, function (alarm) {
                        return (alarm.alarmType!="device");
                    });
                    _.forEach(shippingAlarms, function (alarm) {
                        var isAdded = false;
                        _.forEach(vm.assignedAlarms, function (addedAlarm) {
                            if (addedAlarm.alarmId === alarm.alarmId) {
                                isAdded = true;
                                return false;
                            }
                        });
                        availableAlarms.push(angular.extend(alarm, { isAdded: isAdded }));
                    });

                    vm.availableAlarms = availableAlarms;
                },
                function (error) {
                    $rootScope.loading = false;
                  vm.feedback.addError(error.data.message);
                }
            );
        }

        function beginRemove() {
            vm.mode.isRemoving = true;
            var removableAlarms = [];
            _.forEach(vm.assignedAlarms, function (alarm) {
                removableAlarms.push(angular.extend(alarm, { isRemoved: false }));
            });

            vm.removableAlarms = removableAlarms;
        }

        function endAdd() {
            vm.mode.isAdding = false;
            load();
        }
        function endRemove() {
            vm.mode.isRemoving = false;
            load();
        }

        function goToAlarm(alarmId) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('alarm.admin', { alarmId: alarmId, referrer: returnState, referrerParams: returnStateParams } );
        }

        function load() {
            vm.assignedAlarms = [];
            $rootScope.loading = true;
            var promise = DevicesService.getAlarmsForShipment(vm.editor.shipment.shipmentInfo.shipmentId).$promise;
            promise.then(
                function(result) {
                    console.log("Alarms",result);
                    vm.assignedAlarms = result;
                   /* vm.assignedAlarms = _.remove(result, function (alarm) {
                        return (alarm.isActiveOnShipmentOnly || alarm.isSeparationAlarm);
                    });*/
                    console.log("Result filter alarms",vm.assignedAlarms);
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                   $rootScope.loading = false;
            });
        }

        function removeAlarm(alarm) {
            vm.feedback.clear();
            var promise = DevicesService.removeAlarm(vm.device, alarm,vm.editor.shipment.shipmentInfo.shipmentId).$promise;
            $rootScope.loading = true;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    alarm.isRemoved = true;
                    _.forEach(vm.sentinels,function(s){
                        var addPromise = DevicesService.removeAlarmSentinel(s, alarm, vm.editor.shipment.shipmentInfo.shipmentId).$promise;
                        addPromise.then(
                            function (result) {
                                console.log("addAlarms",result);
                            },
                            function (error) { vm.feedback.addError('Could not add ' + alarm.alarmName); }
                        );
                    });
                },
                function (error) {
                    $rootScope.loading = false;
                   vm.feedback.addError(error.data.message);
                }
            );
        }

        function setPermissions() {
            vm.hasPermission.toChange =
                SentinelUiSession.user.isSystemAdmin || 
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;
        }

    }

})();