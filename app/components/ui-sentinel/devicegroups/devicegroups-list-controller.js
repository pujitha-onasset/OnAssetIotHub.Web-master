(function() {
    'use strict';

    angular
        .module('ui-sentinel.devicegroups')
        .controller('DeviceGroupsListController', DeviceGroupsListController);

    DeviceGroupsListController.$inject = ['$rootScope', 'SentinelUiSession', 'DeviceGroupsService', 'FeedbackService'];
    function DeviceGroupsListController($rootScope, SentinelUiSession, DeviceGroupsService, FeedbackService) {
        var vm = {
            list: null,
            hasPermission: {
                toCreate: false
            },
            feedback: FeedbackService

        };
        activate();
        return vm;

        function activate() {
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'devicegroups.list') {
                    load();
                }
            });

            setPermissions();
            load();
        }

        function load() {
            vm.list = null;
            $rootScope.loading = true;
            var promise = (SentinelUiSession.user.accountId==SentinelUiSession.focus.id) ? 
                DeviceGroupsService.getGroups(SentinelUiSession.focus).$promise :
                DeviceGroupsService.getGroupsByAccountId(SentinelUiSession.focus).$promise;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    var groups = [];

                    _.forEach(result, function(group, key) {
                        var extGroup = angular.extend(group, {
                            deviceCount: group.totalDevices,
                            forwarding: null
                        });

                        groups.push(extGroup);
                        
                    });

                    vm.list = groups;
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function setPermissions() {
            vm.hasPermission.toCreate =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin;
        }
    }
})();

