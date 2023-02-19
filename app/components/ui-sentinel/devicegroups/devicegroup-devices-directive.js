(function () {
    'use strict';

    angular
        .module('ui-sentinel.devicegroups')
        .directive('devicegroupDevices', DeviceGroupDevicesDirective);

    function DeviceGroupDevicesDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'deviceGroupDevices',
            templateUrl: 'ui-sentinel-devicegroups/devicegroup-devices-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
            scope.$watch(
                function(scope) {
                    return scope.deviceGroupAdmin.deviceGroup;
                },
                function (newValue, oldValue) {
                    controller.deviceGroup = newValue;
                }, true
            );
        }
    }

    ThisDirectiveController.$inject = ['$state', 'DeviceGroupsService', 'DevicesService','SentinelUiSession', 'FeedbackService'];
    function ThisDirectiveController($state, DeviceGroupsService, DevicesService, SentinelUiSession, FeedbackService) {
        var vm = {
            feedback: FeedbackService,
            deviceGroup: null,
            devices: [],
            otherGroups: null,
            panel: {
                isCollapsed: true,
                toggle: function () {
                    this.isCollapsed = !this.isCollapsed;
                    if (!this.isCollapsed) { load(); }
                }
            },
            mode: {
                isMoving: this.isImportingGroup || this.isExportingGroup || this.isImportingDevices,
                isImportingGroup: false,
                isExportingGroup: false,
                isImportingDevices: false
            },
            form: {
                isPristine: true,
                deviceTagIds: null,
                validDevices: [],
                invalidDevices: [],
                errors: {
                    isBlank: true
                }
            },
            hasPermission: {
                toMove: false
            },
            actions: {
                importDevices: importDevices,
                beginDevicesImport: beginDevicesImport,
                beginGroupImport: beginGroupImport,
                endMoves: endMoves,
                importGroup: importGroup,
                beginGroupExport: beginGroupExport,
                exportGroup: exportGroup,
                goToDevice: goToDevice,
                reset: reset,
                reload: load
            }
        };
        activate();
        return vm;

        function activate() {
            setPermissions();
        }

        function importDevices() {
            vm.feedback.clear();
            vm.form.isPristine = false;

            vm.form.validDevices = [];
            vm.form.invalidDevices = [];
            
            if (!vm.form.deviceTagIds) {
                vm.form.errors.isBlank = true;
                return;
            }
            vm.form.errors.isBlank = false;

            var tagIds = vm.form.deviceTagIds.split('\n');

            _.forEach(tagIds, function(tagId) {
                //validate device
                vm.form.validDevices.push({"deviceTagId":tagId});
                if (vm.form.validDevices.length === tagIds.length) {
                    moveDevices();
                }
                  

            });
        }

        function beginDevicesImport() {
            vm.form.validDevices = [];
            vm.form.invalidDevices = [];
            vm.mode.isImportingDevices = true;
        }

        function beginGroupImport() {
            loadOtherGroups();
            vm.mode.isImportingGroup = true;
        }

        function beginGroupExport() {
            loadOtherGroups();
            vm.mode.isExportingGroup = true;
        }

        function endMoves() {
            vm.mode.isImportingGroup = false;
            vm.mode.isExportingGroup = false;
            vm.mode.isImportingDevices = false;
            vm.form.devices = null;
            vm.otherGroups = [];
        }
        
        function goToDevice(device) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('device.admin', { deviceTagId: device.deviceTagId, referrer: returnState, referrerParams: returnStateParams } );
        }

        function load() {
            vm.devices = [];
            console.log(vm.deviceGroup);
            var promise = DeviceGroupsService.getDevices(SentinelUiSession.focus, vm.deviceGroup).$promise;
            promise.then(
                function(result) {
                    vm.devices = result;
                },
                function (error) {
                   vm.feedback.addError(error.data.message);
                }
            );
        }

        function loadOtherGroups() {
            vm.otherGroups = [];
            var promise = (SentinelUiSession.user.accountId==SentinelUiSession.focus.id) ? 
                DeviceGroupsService.getGroups(SentinelUiSession.focus).$promise :
                DeviceGroupsService.getGroupsByAccountId(SentinelUiSession.focus).$promise;
            promise.then(
                function(result) {
                    var groups = [];

                    _.forEach(result, function(group) {
                        if (group.id !== vm.deviceGroup.id) {
                            var extGroup = angular.extend(group, {
                                deviceCount: 0,
                                forwarding: null
                            });

                            groups.push(extGroup);

                            var countPromise = DeviceGroupsService.getDevices(SentinelUiSession.focus,extGroup).$promise;
                            countPromise.then(
                                function (result) {
                                    extGroup.deviceCount = result.length;
                                },
                                function (error) {
                                }
                            );

                            var fwdPromise = DeviceGroupsService.getForwarding(SentinelUiSession.focus,extGroup).$promise;
                            fwdPromise.then(
                                function (result) {
                                    extGroup.forwarding = result;
                                },
                                function (error) {
                                }
                            );
                        }
                    });
                    vm.otherGroups = groups;
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function moveDevices() {
            vm.feedback.clear();
            
            vm.form.deviceTagIds = null;
            var counter = 0;
           
                
            var promise = DeviceGroupsService.addDeviceToGroup(SentinelUiSession.focus,vm.deviceGroup, vm.form.validDevices[counter]).$promise;
            promise.then(
                function(result) {
                   moveDevice(counter);
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            );

        }


        function moveDevice(counter) {
            vm.feedback.clear();
            
            vm.form.deviceTagIds = null;

            counter++;
            if (counter >= vm.form.validDevices.length) {
                        load();
                        endMoves();
            }else{
                var promise = DeviceGroupsService.addDeviceToGroup(SentinelUiSession.focus,vm.deviceGroup, vm.form.validDevices[counter]).$promise;
                promise.then(
                    function(result) {
                        moveDevice(counter);
                    },
                    function(error) {
                        vm.feedback.addError(error.data.message);
                    }
                );
            }

        }

        function importGroup(group) {
            vm.feedback.clear();

            var promise = DeviceGroupsService.moveDevices(SentinelUiSession.focus,group, vm.deviceGroup).$promise;
            promise.then(
                function(result) {
                    load();
                    endMoves();
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                    endMoves();
                }
            );
        }

        function exportGroup(group) {
            vm.feedback.clear();

            var promise = DeviceGroupsService.moveDevices(SentinelUiSession.focus,vm.deviceGroup, group).$promise;
            promise.then(
                function(result) {
                    load();
                    endMoves();
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                    endMoves();
                }
            );
        }

        function setPermissions() {
            vm.hasPermission.toMove =
                SentinelUiSession.user.isSystemAdmin || 
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;
        }
        
        function reset() {
            vm.form.isPristine = true;
            vm.form.deviceTagIds = null;
            vm.form.errors.isBlank = true;
            vm.form.validDevices = [];
            vm.form.invalidDevices = [];
        }

    }

})();