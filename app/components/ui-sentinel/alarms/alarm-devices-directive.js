(function () {
    'use strict';

    angular
        .module('ui-sentinel.alarms')
        .directive('alarmDevices', AlarmDevicesDirective);

    function AlarmDevicesDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'alarmDevices',
            templateUrl: 'ui-sentinel-alarms/alarm-devices-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
            scope.$watch(
                function(scope) {
                    return scope.alarmAdmin.alarm;
                },
                function (newValue, oldValue) {
                    controller.alarm = newValue;
                }, true
            );
        }
    }

    ThisDirectiveController.$inject = ['$q', '$rootScope', '$state', 'AlarmsService', 'DevicesService', 'FeedbackService', 'SentinelUiSession', 'SentryAccountApiService', 'SentinelAccountApiService'];
    function ThisDirectiveController($q, $rootScope, $state, AlarmsService, DevicesService, FeedbackService, SentinelUiSession, SentryAccountApiService, SentinelAccountApiService) {
        var vm = {
            alarm: null,
            devices: {
                assigned: [],
                available: [],
                removable: []
            },
            sentinels: {
                assigned: [],
                available: [],
                removable: []
            },
            actions: {
                beginAdd: beginAdd,
                endAdd: endAdd,
                add: add,
                beginRemove: beginRemove,
                endRemove: endRemove,
                remove: remove,
                goToDevice: goToDevice,
                reload: load,
                addAll: addAll,
                removeAll: removeAll,
                addSentinel: addSentinel,
                removeSentinel: removeSentinel,
                /*addAllSentinels: addAllSentinels,
                removeAllSentinels: removeAllSentinels*/
            },
            mode: {
                isAdding: null,
                isRemoving: null
            },
            panel: {
                isCollapsed: true,
                toggle: function () {
                    this.isCollapsed = !this.isCollapsed;
                    if (!this.isCollapsed) { load(); }
                }
            },
            feedback: FeedbackService,
            hasPermission: {
                toChange: false
            },
            deviceSearchText: null,
            getDevicesByFilter: getDevicesByFilter,
            getSentinelsByFilter: getSentinelsByFilter,
        };
        activate();
        return vm;

        function activate() {
            setPermissions();
        }

        function beginAdd() {
            vm.mode.isAdding = true;
            vm.devices.available = [];
            vm.sentinels.available = [];

            vm.sentinelSearchText = null;
            vm.deviceSearchText = null;
  
            $rootScope.loading = true;
            var promise = SentryAccountApiService.getDevicesForASML(SentinelUiSession.focus,"1").$promise;
            promise.then(
                function(result) {
                    var available = [];
                    _.forEach(result, function (device) {
                        var isAdded = false;
                        _.forEach(vm.devices.assigned, function (addedDevice) {
                            if (addedDevice.deviceTagId === device.imei) {
                                isAdded = true;
                                return false;
                            }
                        });
                        available.push(angular.extend(device, { isAdded: isAdded }));
                    });

                    vm.devices.available = available;
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );

            var sentinelsPromise = SentinelAccountApiService.getSentinelsForASML(SentinelUiSession.focus,"0").$promise;
            sentinelsPromise.then(
                function(result) {
                    var available = [];
                    _.forEach(result, function (sentinel) {
                        var isAdded = false;
                        _.forEach(vm.sentinels.assigned, function (addedSentinel) {
                            if (addedSentinel.deviceTagId === sentinel.deviceId) {
                                isAdded = true;
                                return false;
                            }
                        });
                        available.push(angular.extend(sentinel, { isAdded: isAdded }));
                    });

                    vm.sentinels.available = available;
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function getSentinelsByFilter(filter) {
            if(filter === "" || filter === null) {
                filter = "0";
            }

            console.log(filter);

            $rootScope.loading = true;
            var promise = SentinelAccountApiService.getSentinelsForASML(SentinelUiSession.focus,filter).$promise;

            promise.then(
                function(result) {
                    console.log("Sentinels",result);
                    var available = [];
                    _.forEach(result, function (sentinel) {
                        var isAdded = false;
                        _.forEach(vm.sentinels.assigned, function (addedSentinel) {
                            if (addedSentinel.deviceTagId === sentinel.deviceId) {
                                isAdded = true;
                                return false;
                            }
                        });
                        available.push(angular.extend(sentinel, { isAdded: isAdded }));
                    });

                    vm.sentinels.available = available;
                }, function(error) {
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
                    
        }

        function getDevicesByFilter(filter){
            if(filter === "" || filter === null) {
                filter = "1";
            }

            $rootScope.loading = true;
            var promise = SentryAccountApiService.getDevicesForASML(SentinelUiSession.focus,filter).$promise;

            promise.then(
                function(result) {
                    var available = [];
                    _.forEach(result, function (device) {
                        var isAdded = false;
                        _.forEach(vm.devices.assigned, function (addedDevice) {
                            if (addedDevice.deviceTagId === device.imei) {
                                isAdded = true;
                                return false;
                            }
                        });
                        available.push(angular.extend(device, { isAdded: isAdded }));
                    });

                    vm.devices.available = available;
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });

        }

        function endAdd() {
            vm.mode.isAdding = false;
            vm.devices.available = [];
            vm.sentinels.available = [];
        }

        function beginRemove() {
            vm.mode.isRemoving = true;
            vm.devices.removable = [];
            vm.sentinels.removable = [];

            var removable = [];
            _.forEach(vm.devices.assigned, function (device) {
                removable.push(angular.extend(device, { isRemoved: false }));
            });

            var sentinelsRemovable = [];
            _.forEach(vm.sentinels.assigned, function (sentinel) {
                sentinelsRemovable.push(angular.extend(sentinel, { isRemoved: false }));
            });

            vm.devices.removable = removable;
            vm.sentinels.removable = sentinelsRemovable;
        }

        function endRemove() {
            vm.mode.isRemoving = false;
            vm.devices.removable = [];
            vm.sentinels.removable = [];
        }

        function add(device) {
            $rootScope.loading = true;
            vm.feedback.clear();

            var promise = AlarmsService.addDevice(vm.alarm, device).$promise;
            promise.then(
                function(result) {
                    vm.devices.assigned = result;
                    device.isAdded = true;
                    device.isRemoved = false;
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function addSentinel(sentinel) {
            $rootScope.loading = true;
            vm.feedback.clear();

            var promise = AlarmsService.addSentinel(vm.alarm, sentinel).$promise;
            promise.then(
                function(result) {
                    vm.sentinels.assigned = result;
                    sentinel.isAdded = true;
                    sentinel.isRemoved = false;
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function addAll() {
            vm.feedback.clear();
            $rootScope.loading = true;
            var promises = [];

            _.forEach(vm.devices.available, function (device) {
                var promise = AlarmsService.addDevice(vm.alarm, device).$promise;
                promise.then(
                    function(result) {
                        vm.devices.assigned = result;
                        device.isAdded = true;
                        device.isRemoved = false;
                    },
                    function (error) {
                        console.log(error);
                        vm.feedback.addError(error.data.message);
                    }
                );
                promises.push(promise);
            });

            _.forEach(vm.sentinels.available, function (sentinel) {
                var promise = AlarmsService.addSentinel(vm.alarm, sentinel).$promise;
                promise.then(
                    function(result) {
                        vm.sentinels.assigned = result;
                        sentinel.isAdded = true;
                        sentinel.isRemoved = false;
                    },
                    function (error) {
                        console.log(error);
                        vm.feedback.addError(error.data.message);
                    }
                );
                promises.push(promise);
            });

            $q.all(promises).then(function(){
                $rootScope.loading = false;
            }).catch(function(e){
                $rootScope.loading = false;
                console.log(e);
            });

            endAdd();
        }

        function remove(device) {
            $rootScope.loading = true;
            vm.feedback.clear();

            var promise = AlarmsService.removeDevice(vm.alarm, device).$promise;
            promise.then(
                function(result) {
                    vm.devices.assigned = result;
                    device.isRemoved = true;
                    device.isAdded = false;
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function removeSentinel(sentinel) {
            $rootScope.loading = true;
            vm.feedback.clear();

            var promise = AlarmsService.removeSentinel(vm.alarm, sentinel).$promise;
            promise.then(
                function(result) {
                    vm.sentinels.assigned = result;
                    sentinel.isRemoved = true;
                    sentinel.isAdded = false;
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function removeAll() {
            $rootScope.loading = true;
            vm.feedback.clear();
            var promises = [];

            _.forEach(vm.devices.removable, function (device) {
                var promise = AlarmsService.removeDevice(vm.alarm, device).$promise;
                promise.then(
                    function(result) {
                        vm.devices.assigned = result;
                        device.isRemoved = true;
                        device.isAdded = false;
                    },
                    function (error) {
                        console.log(error);
                        vm.feedback.addError(error.data.message);
                    }
                );
                promises.push(promise);
            });

            _.forEach(vm.sentinels.removable, function (sentinel) {
                var promise = AlarmsService.removeSentinel(vm.alarm, sentinel).$promise;
                promise.then(
                    function(result) {
                        vm.sentinels.assigned = result;
                        sentinel.isRemoved = true;
                        sentinel.isAdded = false;
                    },
                    function (error) {
                        console.log(error);
                        vm.feedback.addError(error.data.message);
                    }
                );
                promises.push(promise);
            });

            $q.all(promises).then(function(){
                $rootScope.loading = false;
            }).catch(function(e){
                $rootScope.loading = false;
                console.log(e);
            });

            endRemove();
        }

        function load() {
            $rootScope.loading = true;
            vm.devices.assigned = [];
            vm.sentinels.assigned = [];

            var promise = AlarmsService.getDevices(SentinelUiSession.focus, vm.alarm).$promise;
            promise.then(
                function(result) {
                    vm.devices.assigned = result;
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            );

            var sentinelPromise = AlarmsService.getSentinels(SentinelUiSession.focus, vm.alarm).$promise;
            sentinelPromise.then(
                function(result) {
                    vm.sentinels.assigned = result;
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function setPermissions() {
            if (SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor) {

                vm.hasPermission.toChange = true;
            }
        }

        function goToDevice(device) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('device.admin', { deviceTagId: device.deviceTagId, referrer: returnState, referrerParams: returnStateParams } );
        }

    }

})();