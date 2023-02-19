(function () {
    'use strict';

    angular
        .module('ui-sentinel.sentry-configs')
        .directive('sentryCommandLog', SentryCommandLogDirective);

    function SentryCommandLogDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'sentryCommandLog',
            templateUrl: 'ui-sentinel-sentry-configs/sentry-command-log-directive.html',
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
            commands: null,
            feedback: FeedbackService,
            panel: {
                isCollapsed: true,
                toggle: function () {
                    this.isCollapsed = !this.isCollapsed;
                    if (!this.isCollapsed) { load(); }
                }
            },
            hasPermission: {
                toReadAdminCommands: false
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
            vm.commands = null;
            var promise = DeviceCommandsService.getAll(SentinelUiSession.focus.id, vm.device).$promise;
            promise.then(
                function(result) {
                    vm.commands = result;
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function setPermissions() {
            vm.hasPermission.toReadAdminCommands =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isSupportAdmin ||
                SentinelUiSession.user.isSupportObserver;
        }
    }

})();