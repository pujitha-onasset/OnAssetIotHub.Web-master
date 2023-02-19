(function () {
    'use strict';

    angular
        .module('ui-sentinel.alarms')
        .directive('alarmSubscribers', AlarmSubscribersDirective);

    function AlarmSubscribersDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'alarmSubscribers',
            templateUrl: 'ui-sentinel-alarms/alarm-subscribers-directive.html',
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
        }    }

    ThisDirectiveController.$inject = ['$rootScope', '$state', 'AlarmsService', 'AlarmContactsService', 'FeedbackService', 'SentinelUiSession'];
    function ThisDirectiveController($rootScope, $state, AlarmsService, AlarmContactsService, FeedbackService, SentinelUiSession) {
        var vm = {
            alarm: null,
            contacts: {
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
                goToContact: goToContact,
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

        function add(contact) {
            $rootScope.loading = true;
            vm.feedback.clear();

            var promise = AlarmsService.addSubscriber(vm.alarm, contact).$promise;
            promise.then(
                function(result) {
                    vm.contacts.assigned = result;
                    contact.isAdded = true;
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function beginAdd() {
            vm.mode.isAdding = true;
            vm.contacts.available = [];

            var promise = AlarmContactsService.getContacts(SentinelUiSession.focus).$promise;
            promise.then(
                function(result) {
                    var available = [];
                    _.forEach(result, function (contact) {
                        var isAdded = false;
                        _.forEach(vm.contacts.assigned, function (addedContact) {
                            if (addedContact.contactId === contact.contactId) {
                                isAdded = true;
                                return false;
                            }
                        });
                        available.push(angular.extend(contact, { isAdded: isAdded }));
                    });

                    vm.contacts.available = available;
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function endAdd() {
            vm.mode.isAdding = false;
            vm.contacts.available = [];
            load();
        }

        function beginRemove() {
            vm.mode.isRemoving = true;
            vm.contacts.removable = [];

            var removable = [];
            _.forEach(vm.contacts.assigned, function (contact) {
                removable.push(angular.extend(contact, { isRemoved: false }));
            });

            vm.contacts.removable = removable;
        }

        function endRemove() {
            vm.mode.isRemoving = false;
            vm.contacts.removable = [];
            load();
        }

        function goToContact(contact) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('alarmcontact.admin', { contactId: contact.contactId, referrer: returnState, referrerParams: returnStateParams } );
        }

        function remove(contact) {
            $rootScope.loading = true;
            vm.feedback.clear();

            var promise = AlarmsService.removeSubscriber(vm.alarm, contact).$promise;
            promise.then(
                function(result) {
                    vm.contacts.assigned = result;
                    contact.isRemoved = true;
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
            vm.contacts.assigned = [];
            var promise = AlarmsService.getSubscribers(vm.alarm).$promise;
            promise.then(
                function(result) {
                    vm.contacts.assigned = result;
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