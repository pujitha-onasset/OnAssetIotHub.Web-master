(function() {
    'use strict';

    angular
        .module('ui-sentinel.sentry-commands')
        .controller('SentryCommandsLogController', SentryCommandsLogController);

    /////////////

    SentryCommandsLogController.$inject = ['$rootScope', '$state', 'SentinelUiSession', 'FeedbackService', 'DeviceCommandsService'];
    function SentryCommandsLogController($rootScope, $state, SentinelUiSession, FeedbackService, DeviceCommandsService) {
        var vm = {
            imei: $state.params.imei,
            load: load,
            commands: null,
            feedback: FeedbackService,
        };
        activate();
        return vm;

        function activate() {
            vm.feedback.clear();
            load();
        }

        function load() {
            vm.commands = null;
            $rootScope.loading = true;

            var promise = DeviceCommandsService.getAll(SentinelUiSession.focus.id, vm.imei).$promise;

            promise.then(
                function(result) {
                    console.log(result);
                    vm.commands = result;
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }
    }

})();