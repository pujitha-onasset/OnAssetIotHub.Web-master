(function() {
    'use strict';

    angular
        .module('ui-sentinel.fulfillment')
        .controller('FulfillmentConfigController', FulfillmentConfigController);

    FulfillmentConfigController.$inject = ['$rootScope', '$scope', '$state', 'SentinelUiSession', 'FeedbackService', 'DeviceCommandsService', 'DeviceGroupsService'];
    function FulfillmentConfigController($rootScope, $scope, $state, SentinelUiSession, FeedbackService, DeviceCommandsService, DeviceGroupsService) {
        var vm = {
            currentTab: "params",
            imeiText: null,
            imeiList: null,
            imeiIndex: -1,
            imeiCurrent: null,
            command: null,
            results: null,
            configBy: 'list',
            groups: null,
            groupId: null,
            feedback: FeedbackService,
            goToParams: goToParams,
            goToImeis: goToImeis,
            goToResults: goToResults,
            start: start,
            goToDeviceAdmin: goToDeviceAdmin
        };

        activate();
        return vm;

        function activate() {
            vm.feedback.clear();
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'fulfillment.config') {
                    load();
                }
            });

            $scope.$watch(
                function() {
                    return vm.results;
                },
                function (results) {

                }, true
            );


            load();
        }

        function load() {
            vm.groups = null;
            vm.groupId = null;
            var promise = (SentinelUiSession.user.accountId==SentinelUiSession.focus.id) ? 
                DeviceGroupsService.getGroups(SentinelUiSession.focus).$promise :
                DeviceGroupsService.getGroupsByAccountId(SentinelUiSession.focus).$promise;
            promise.then(
                function(result) {
                    vm.groups = result;
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function goToParams() {
            vm.currentTab = 'params';
        }

        function goToImeis() {
            vm.currentTab = 'imeis';
        }

        function goToResults() {
            if (vm.results) {
                vm.currentTab = 'results';
            }
        }

        function start() {
            if (vm.configBy === 'list' && (!vm.imeiText || !vm.command)) {
                return;
            }

            if (vm.configBy === 'group' && !vm.groupId) {
                return;
            }

            $rootScope.loading = true;

            vm.imeiList = null;
            vm.results = null;
            vm.imeiCurrent = null;
            vm.imeiReports = null;
            vm.imeiFirmware = null;
            vm.imeiIndex = -1;
            var results = [];

            if (vm.configBy === 'list') {
                vm.imeiList = _.split(vm.imeiText, '\n');
                for (var i = 0; i < vm.imeiList.length; i++) {
                    results.push({
                        imei: vm.imeiList[i],
                        commandHref: null,
                        commandStatus: null
                    });
                }
                vm.results = results;
                vm.currentTab = 'results';

                submitForNextImei();
            }
            else {
                var groupDevicesPromise = DeviceGroupsService.getDevices(SentinelUiSession.focus,{id: vm.groupId}).$promise;
                groupDevicesPromise.then(
                    function (devices) {
                        var imeiList = [];
                        results = [];
                        for (var i = 0; i < devices.length; i++) {
                            imeiList.push(devices[i].imei);
                            results.push({
                                imei: devices[i].imei,
                                commandHref: null,
                                commandStatus: null
                            });
                        }
                        vm.imeiList = imeiList;
                        vm.results = results;
                        vm.currentTab = 'results';

                        submitForNextImei();
                    },
                    function (error) {
                        vm.feedback.addError(error.data.message);
                    }
                );
            }
        }

        function submitForNextImei() {
            vm.imeiIndex++;
            vm.imeiCurrent = null;

            if (vm.imeiIndex >= vm.imeiList.length) {
                return;
            }

            vm.imeiCurrent = vm.imeiList[vm.imeiIndex];
            var commandPromise = DeviceCommandsService.submitCommand(SentinelUiSession.focus.id, vm.imeiCurrent, vm.command).$promise;
            commandPromise.then(
                function (results) {
                    var imeiResult = vm.results[vm.imeiIndex];
                    imeiResult.commandHref = results.href;
                    imeiResult.commandStatus = 'pending';
                    submitForNextImei();
                },
                function (error) {
                    console.log(error);

                    var imeiResult = vm.results[vm.imeiIndex];
                    imeiResult.commandHref = null;
                    imeiResult.commandStatus = 'error';
                    submitForNextImei();
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function goToDeviceAdmin(imei) {
            if (imei) {
                //$state.go('device.admin',{ deviceTagId: imei, referrer: 'fulfillment.config'  });
                $state.go('sentry-commands.queue', { imei: imei });
            }
        }        
    }
})();

