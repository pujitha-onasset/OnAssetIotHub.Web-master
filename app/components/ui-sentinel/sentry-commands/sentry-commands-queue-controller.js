(function() {
    'use strict';

    angular
        .module('ui-sentinel.sentry-commands')
        .controller('SentryCommandsQueueController', SentryCommandsQueueController);

    SentryCommandsQueueController.$inject = ['$rootScope', '$state', 'SentinelUiSession', 'FeedbackService', 'DeviceCommandsService'];
    function SentryCommandsQueueController($rootScope, $state, SentinelUiSession, FeedbackService, DeviceCommandsService) {
        var vm = {
            imei: $state.params.imei,
            load: load,
            pendingCommands: null,
            feedback: FeedbackService,
            hasPermission: {
                toCancelCommands: false
            },
            pendingCommandToCancel: null,
            cancelBegin: cancelBegin,
            cancelCancel: cancelCancel,
            cancelCommand: cancelCommand,
        };
        var genericCancelErrorMessage = "Unexpected error ocurred while cancelling a command";
        activate();
        return vm;

        function activate() {
            vm.feedback.clear();
            setPermissions();
            load();
        }

        function load() {
            vm.pendingCommands = null;
            $rootScope.loading = true;
            $('.modal').modal('hide');

            var promise = DeviceCommandsService.getPending(SentinelUiSession.focus.id, vm.imei).$promise;

            promise.then(
                function(result) {
                    console.log(result);
                    vm.pendingCommands = result;
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
            vm.hasPermission.toCancelCommands = SentinelUiSession.user.isSystemAdmin;
        }

        function cancelBegin(pendingCommand) {
            console.log(pendingCommand);
            vm.pendingCommandToCancel = pendingCommand;
            vm.deleteErrorMessage = null;
        }

        function cancelCancel() {
            vm.deleteErrorMessage = null;
            vm.deleteInProgress = false;
            vm.pendingCommandToCancel = null;
        }

        function cancelCommand() {
            if (vm.pendingCommandToCancel !== null) {
                $rootScope.loading = true;

                var promise = DeviceCommandsService.cancelCommand(SentinelUiSession.focus.id, vm.pendingCommandToCancel.commandId, vm.pendingCommandToCancel.id).$promise;
                promise.then(
                    function (result) {
                        load();
                    },
                    function (error) {
                        console.log(error);
                        vm.cancelErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericCancelErrorMessage;
                    }
                ).finally(function(){
                    $rootScope.loading = false;
                });
            }
        }
    }

})();