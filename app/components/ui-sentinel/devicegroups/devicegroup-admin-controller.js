(function() {
    'use strict';

    angular
        .module('ui-sentinel.devicegroups')
        .controller('DeviceGroupAdminController', DeviceGroupAdminController);

    DeviceGroupAdminController.$inject = ['$rootScope', '$state', '$stateParams', 'DeviceGroupsService', 'SentinelUiSession', 'FeedbackService'];
    function DeviceGroupAdminController($rootScope, $state, $stateParams, DeviceGroupsService, SentinelUiSession, FeedbackService) {
        var vm = {
            deviceGroup: null,
            feedback: FeedbackService,
            groupName: {
                value: null,
                isPristine: true,
                hasError: function() {
                    return this.errors.isBlank || this.errors.isDuplicate;
                },
                errors: {
                    isBlank: true,
                    isDuplicate: false
                },
                validate: function() {
                    this.isPristine = false;
                    this.errors.isBlank = !this.value;
                    this.errors.isDuplicate = false;
                }
            },
            mode: {
                isNew: false,
                isRemoving: false
            },
            hasPermission: {
                toChange: false,
                toDelete: false
            },
            actions: {
                close: close,
                reset: reset,
                submit: submit,
                beginRemove: beginRemove,
                remove: remove,
                endRemove: endRemove
            }
        };
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'devicegroup.admin' || $rootScope.$state.current.name == 'devicegroup.new') {
                    $state.go('devicegroups.list');
                }                
            });

            setPermissions();
            vm.mode.isNew = $state.current.name === 'devicegroup.new';
            if (!vm.mode.isNew) {
                load();
            }
        }
        
        function beginRemove() {
            vm.mode.isRemoving = true;
        }
        
        function endRemove() {
            vm.mode.isRemoving = false;
        }

        function load() {
            $rootScope.loading = true;
            var promise = DeviceGroupsService.getGroup(SentinelUiSession.focus,$stateParams.groupId).$promise;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.deviceGroup = result;
                    reset();
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function close() {
            vm.deviceGroup = null;
            $state.go($stateParams.referrer, $stateParams.referrerParams);
        }

        function reset() {
            if (!vm.deviceGroup) {
                vm.groupName.value = null;
            }
            else {
                $state.current.data.subTitle = vm.deviceGroup.groupName;
                vm.groupName.value = vm.deviceGroup.groupName;
            }

            vm.groupName.isPristine = true;
            vm.groupName.errors.isBlank = true;
            vm.groupName.errors.isDuplicate = false;
        }

        function remove() {
            vm.feedback.clear();
            $rootScope.loading = true;
            var promise = DeviceGroupsService.removeGroup(SentinelUiSession.focus,vm.deviceGroup).$promise;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    close();
                },
                function (error) {
                    $rootScope.loading = false;
                    if (error.status === -1) {
                        vm.feedback.addError('Unable to connect to server.  Please try again later.');
                        return;
                    }

                    if (error.status === 400 && error.data.message.indexOf('assigned devices') > -1) {
                        vm.feedback.addError('Please transfer devices to another device group before deleting ' + vm.deviceGroup.groupName);
                        return;
                    }

                    if (error.status === 400 && error.data.message.indexOf('Forwarding is setup') > -1) {
                        vm.feedback.addError('Please remove forwarding configuration before deleting ' + vm.deviceGroup.groupName);
                        return;
                    }

                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function setPermissions() {
            vm.hasPermission.toChange =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;

            vm.hasPermission.toDelete =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin;
        }

        function submit() {
            
            vm.feedback.clear();
            
            vm.groupName.validate();
            if (vm.groupName.hasError()) {
                return;
            }

            var deviceGroup = {
                groupName: vm.groupName.value,
                isRootGroup: false
            };
            if (!vm.mode.isNew) {
                deviceGroup.id = vm.deviceGroup.id;
                deviceGroup.isRootGroup = vm.deviceGroup.isRootGroup;
            }
            $rootScope.loading = true;

            var promise = vm.mode.isNew ?
                DeviceGroupsService.addGroup(SentinelUiSession.focus, deviceGroup).$promise :
                DeviceGroupsService.updateGroup(deviceGroup).$promise;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.feedback.addSuccess(result.groupName + ' has been ' + (vm.mode.isNew ? 'created' : 'updated'));
                    $state.go('devicegroup.admin', {groupId: result.id});
                },
                function (error) {
                    $rootScope.loading = false;
                    if (error.status === -1) {
                        vm.feedback.addError('Unable to connect to server.  Please try again later.');
                        return;
                    }

                    if (error.status === 400 && error.data.message.indexOf('already exists') > -1) {
                        vm.groupName.errors.isDuplicate = true;
                        return;
                    }

                    vm.feedback.addError(error.data.message);
                }
            );
        }
    }
})();