(function () {
    'use strict';

    angular
        .module('ui-sentinel.alarms')
        .directive('contactSubscriptions', ContactSubscriptionsDirective);

    function ContactSubscriptionsDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'contactSubscriptions',
            templateUrl: 'ui-sentinel-alarms/alarmcontact-subscriptions-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
            scope.$watch(
                function(scope) {
                    return scope.alarmContactUi.alarmContact;
                },
                function (newValue, oldValue) {
                    controller.contact = newValue;
                }, true
            );
        }
    }

    ThisDirectiveController.$inject = ['$rootScope', '$state', 'AlarmsService', 'AlarmContactsService', 'FeedbackService', 'SentinelUiSession'];
    function ThisDirectiveController($rootScope, $state, AlarmsService, AlarmContactsService, FeedbackService, SentinelUiSession) {
        var vm = {
            contact: null,
            alarms: {
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
                goToAlarm: goToAlarm,
                reload: load
            },
            mode: {
                isAdding: false,
                isRemoving: false
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

        function beginAdd() {
            vm.mode.isAdding = true;
            vm.alarms.available = null;
            $rootScope.loading = true;
            var promise = (SentinelUiSession.user.isAnAdmin && (SentinelUiSession.user.accountId==SentinelUiSession.focus.id))?
             AlarmsService.getAlarms(SentinelUiSession.focus).$promise:AlarmsService.getAlarmsAccount(SentinelUiSession.focus).$promise;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    var available = [];
                    _.forEach(result, function (alarm) {
                        var isAdded = false;
                        _.forEach(vm.alarms.assigned, function (addedAlarm) {
                            if (addedAlarm.alarmId === alarm.alarmId) {
                                isAdded = true;
                                return false;
                            }
                        });
                        available.push(angular.extend(alarm, { isAdded: isAdded }));
                    });

                    vm.alarms.available = available;
                },
                function (error) {
                    $rootScope.loading = false;
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function endAdd() {
            vm.mode.isAdding = false;
            vm.alarms.available = null;
            load();
        }

        function beginRemove() {
            vm.mode.isRemoving = true;
            vm.alarms.removable = null;

            var removable = [];
            _.forEach(vm.alarms.assigned, function (alarm) {
                removable.push(angular.extend(alarm, { isRemoved: false }));
            });

            vm.alarms.removable = removable;
        }

        function endRemove() {
            vm.mode.isRemoving = false;
            vm.alarms.removable = null;
            load();
        }

        function add(alarm) {
            $rootScope.loading = true;
            vm.feedback.clear();

            var promise = AlarmsService.addSubscriber(alarm, vm.contact).$promise;
            promise.then(
                function(result) {
                    vm.alarms.assigned = result;
                    alarm.isAdded = true;
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }
        
        function goToAlarm(alarmId) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('alarm.admin', { alarmId: alarmId, referrer: returnState, referrerParams: returnStateParams } );
        }

        function remove(alarm) {
            $rootScope.loading = true;
            vm.feedback.clear();

            var promise = AlarmsService.removeSubscriber(alarm, vm.contact).$promise;
            promise.then(
                function(result) {
                    vm.alarms.assigned = result;
                    alarm.isRemoved = true;
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function load() {
            $rootScope.loading = true;
            vm.alarms.assigned = null;

            var promise = AlarmContactsService.getSubscriptions(vm.contact).$promise;
            promise.then(
                function(result) {
                    vm.alarms.assigned = result;
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
            vm.hasPermission.toChange =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;
        }
    }

})();