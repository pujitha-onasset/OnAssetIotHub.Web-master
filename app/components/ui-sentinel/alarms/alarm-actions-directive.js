(function () {
    'use strict';

    angular
        .module('ui-sentinel.alarms')
        .directive('alarmActions', AlarmActionsDirective);

    function AlarmActionsDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'alarmActions',
            templateUrl: 'ui-sentinel-alarms/alarm-actions-directive.html',
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

    ThisDirectiveController.$inject = ['$rootScope', 'AlarmsService', 'FeedbackService', 'SentinelUiSession'];
    function ThisDirectiveController($rootScope, AlarmsService, FeedbackService, SentinelUiSession) {
        var vm = {
            alarm: null,
            frequencyAction: null,
            maxFrequency: {
                minutes: 120,
                hours: 48
            },
            minFrequency: {
                minutes: 5,
                hours: 1
            },
            form: {
                isChanging: null,
                standardInterval: null,
                extendedInterval: null,
                standardIntervalUnit: 'minutes',
                extendedIntervalUnit: 'hours'
            },
            actions: {
                begin: begin,
                end: end,
                submit: submit,
                remove: remove,
                reload: load
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
            }
        };
        activate();
        return vm;

        function activate() {
            setPermissions();
        }

        function begin() {
            vm.form.isChanging = true;
        }

        function end() {
            vm.form.isChanging = false;
            reset();
        }

        function submit() {
            var config = {
                alarmId: vm.alarm.alarmId,
                standardInterval: vm.form.standardInterval !== null ? Math.round(vm.form.standardInterval) + ' ' + vm.form.standardIntervalUnit : null,
                extendedInterval:  vm.form.extendedInterval !== null ? Math.round(vm.form.extendedInterval) + ' ' + vm.form.extendedIntervalUnit : null
            };

            if (config.standardInterval !== null || config.extendedInterval !== null) {
                change(config);
            } else {
                remove();
            }
        }

        function change(config) {
            $rootScope.loading = true;
            vm.feedback.clear();
            var promise = AlarmsService.changeConfigAction(vm.alarm, config).$promise;
            promise.then(
                function(result) {
                    vm.frequencyAction = result;
                    reset();
                    end();
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function remove() {
            $rootScope.loading = true;
            vm.feedback.clear();
            var promise = AlarmsService.removeConfigAction(vm.alarm).$promise;
            promise.then(
                function(result) {
                    vm.frequencyAction = result;
                    reset();
                    end();
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                    vm.form.isChanging = false;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function load() {
            $rootScope.loading = true;
            vm.frequencyAction = null;
            var promise = AlarmsService.getConfigAction(vm.alarm).$promise;
            promise.then(
                function(result) {
                    vm.frequencyAction = result;
                    reset();
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function reset() {

            if (!vm.frequencyAction) {
                vm.form.standardInterval = null;
                vm.form.extendedInterval = null;
                vm.form.standardIntervalUnit = 'minutes';
                vm.form.extendedIntervalUnit = 'hours';
            }
            else {
                vm.form.standardInterval = vm.frequencyAction.standardInterval === null ? null : Number(vm.frequencyAction.standardInterval.split(' ')[0]);
                vm.form.extendedInterval = vm.frequencyAction.extendedInterval === null ? null : Number(vm.frequencyAction.extendedInterval.split(' ')[0]);
                vm.form.standardIntervalUnit = vm.frequencyAction.standardInterval === null ? 'minutes' :  vm.frequencyAction.standardInterval.split(' ')[1] ;
                vm.form.extendedIntervalUnit = vm.frequencyAction.extendedInterval === null ? 'hours' : vm.frequencyAction.extendedInterval.split(' ')[1];
            }
        }

        function setPermissions() {
            vm.hasPermission.toChange = SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;
        }
    }

})();