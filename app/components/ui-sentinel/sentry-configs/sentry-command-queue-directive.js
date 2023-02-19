(function () {
    'use strict';

    angular
        .module('ui-sentinel.sentry-configs')
        .directive('sentryCommandQueue', SentryCommandQueueDirective);

    function SentryCommandQueueDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'sentryCommandQueue',
            templateUrl: 'ui-sentinel-sentry-configs/sentry-command-queue-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
            scope.$watch(
                function(scope) {
                    return scope.sentryConfigsByDeviceUi.imei;
                },
                function (newValue, oldValue) {
                    controller.device = newValue;
                }, true
            );
        }        
    }

    ThisDirectiveController.$inject = ['DeviceCommandsService', 'SentinelUiSession', 'FeedbackService'];
    function ThisDirectiveController(DeviceCommandsService, SentinelUiSession, FeedbackService) {
        var vm = {
            device: null,
            pendingCommands: null,
            feedback: FeedbackService,
            panel: {
                isCollapsed: true,
                toggle: function () {
                    this.isCollapsed = !this.isCollapsed;
                    if (!this.isCollapsed) { load(); }
                }
            },
            hasPermission: {
                toCancelCommands: false
            },
            actions: {
                reload: load
            }
        };
        activate();
        return vm;

        function activate() {
            setPermissions();
        }

        function load() {
            vm.pendingCommands = null;
            var promise = DeviceCommandsService.getPending(SentinelUiSession.focus.id, vm.device).$promise;
            promise.then(
                function(result) {
                    vm.pendingCommands = result;
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function setPermissions() {
            vm.hasPermission.toCancelCommands =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isSupportAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;
        }
    }
})();