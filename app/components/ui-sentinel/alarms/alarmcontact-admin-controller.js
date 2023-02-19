(function() {
    'use strict';

    angular
        .module('ui-sentinel.alarms')
        .controller('AlarmContactAdminController', AlarmContactAdminController);

    AlarmContactAdminController.$inject = ['$rootScope', '$state', '$stateParams', 'AlarmContactsService', 'FeedbackService', 'SentinelUiSession'];
    function AlarmContactAdminController($rootScope, $state, $stateParams, AlarmContactsService, FeedbackService, SentinelUiSession) {
        var vm = {
            alarmContact: null,
            firstname: {
                value: null,
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank;
                },
                errors: {
                    isBlank: true
                },
                validate: function () {
                    this.isPristine = false;
                    this.errors.isBlank = !this.value;
                }
            },
            lastname: {
                value: null,
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank;
                },
                errors: {
                    isBlank: true
                },
                validate: function () {
                    this.isPristine = false;
                    this.errors.isBlank = !this.value;
                }
            },
            email: {
                value: null,
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank || this.errors.isBadFormat;
                },
                errors: {
                    isBlank: true,
                    isBadFormat: false
                },
                validate: validateEmail
            },
            sms: {
                value: null,
                isPristine: true,
                hasError: function () {
                    return this.errors.isBadFormat;
                },
                errors: {
                    isBadFormat: false
                },
                validate: validateSms
            },
            isNew: false,
            isRemoving: false,
            feedback: FeedbackService,
            hasPermission: {
                toChange: false,
                toDelete: false
            },
            actions: {
                close: close,
                reset: reset,
                submit: submit,
                beginRemove: beginRemove,
                cancelRemove: cancelRemove,
                remove: remove
            }
        };
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'alarmcontact.admin' || $rootScope.$state.current.name == 'alarmcontact.new') {
                    $state.go('alarmcontacts.list');
                }
            });

            setPermissions();

            if ($stateParams.contactId) {
                load();
            } else {
                vm.isNew = true;
                reset();
            }
        }

        function beginRemove() {
            vm.isRemoving = true;
        }

        function cancelRemove() {
            vm.isRemoving = false;
        }

        function load() {
            $rootScope.loading = true;
            vm.alarmContact = null;

            var promise = AlarmContactsService.getContact($stateParams.contactId).$promise;
            promise.then(
                function(result) {
                    vm.alarmContact = result;
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

        function close() {
            vm.alarmContact = null;
            $state.go($stateParams.referrer, $stateParams.referrerParams);
        }

        function reset() {
            if (!vm.alarmContact) {
                vm.firstname.value = null;
                vm.lastname.value = null;
                vm.email.value = null;
                vm.sms.value = null;
            }
            else {
                $state.current.data.subTitle = vm.alarmContact.lastname + ',' + vm.alarmContact.firstname;
                vm.firstname.value = vm.alarmContact.firstname;
                vm.lastname.value = vm.alarmContact.lastname;
                vm.email.value = vm.alarmContact.emailAddress;
                vm.sms.value = vm.alarmContact.smsAddress;
            }

            vm.firstname.isPristine = true;
            vm.firstname.errors.isBlank = true;

            vm.lastname.isPristine = true;
            vm.lastname.errors.isBlank = true;

            vm.email.isPristine = true;
            vm.email.errors.isBlank = true;
            vm.email.errors.isBadFormt = false;

            vm.sms.isPristine = true;
            vm.sms.errors.isBlank = true;
            vm.sms.errors.isBadFormt = false;
        }

        function submit() {
            
            vm.feedback.clear();

            vm.firstname.validate();
            vm.lastname.validate();
            vm.email.validate();
            vm.sms.validate();

            if (vm.firstname.hasError() || vm.lastname.hasError() || vm.email.hasError() || vm.sms.hasError()) {
                return;
            }
            $rootScope.loading = true;
            var alarmContact = {
                firstname: vm.firstname.value,
                lastname: vm.lastname.value,
                emailAddress: vm.email.value,
                isNotifyByEmailOn: true,
                smsAddress: vm.sms.value && vm.sms.value.trim().length > 0 ? vm.sms.value : null,
                isNotifyBySmsOn: vm.sms.value ? true : false,
                isActive: true
            };
            if (vm.alarmContact) {
                alarmContact.contactId = vm.alarmContact.contactId;
            }

            var promise =  vm.isNew ?
                AlarmContactsService.addContact(SentinelUiSession.focus, alarmContact).$promise :
                AlarmContactsService.changeContact(alarmContact).$promise;
            promise.then(
                function(result) {
                    vm.feedback.addSuccess(alarmContact.lastname + ', ' + alarmContact.firstname + ' has been ' + (vm.isNew ? 'created' : 'updated'));
                    if (vm.isNew) {
                        $state.go('alarmcontact.admin', { contactId: result.contactId });

                        return;
                    }
                    vm.alarmContact = result;
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

        function setPermissions() {
            vm.hasPermission.toChange =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;

            vm.hasPermission.toDelete =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin;
        }

        function remove() {
            $rootScope.loading = true;
            vm.feedback.clear();

            var promise = AlarmContactsService.removeContact(vm.alarmContact).$promise;
            promise.then(
                function(result) {
                    vm.feedback.addSuccess(vm.alarmContact.lastname + ', ' + vm.alarmContact.firstname + ' has been deleted');
                    vm.alarmContact = null;
                    $state.go('alarmcontacts.list');
                },
                function (error) {
                    console.log(error);
                    if (error.data.message.indexOf('Remove subscriptions') > -1) {
                        vm.feedback.addError('Please remove alarm subscriptions before deleting ' + vm.alarmContact.lastname + ', ' + vm.alarmContact.firstname);
                        cancelRemove();
                        return;
                    }
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function validateEmail() {
            vm.email.isPristine = false;
            vm.email.errors.isBadFormat = false;

            vm.email.errors.isBlank = !vm.email.value;
            if (vm.email.errors.isBlank) {
                return;
            }

            var formatValidator = /^([\w+-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/i;
            vm.email.errors.isBadFormat = !formatValidator.test(vm.email.value.trim());
        }

        function validateSms() {
            vm.sms.isPristine = false;
            vm.sms.errors.isBadFormat = false;

            if (!vm.sms.value) {
                return;
            }

            var formatValidator = /^([\w+-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/i;
            vm.sms.errors.isBadFormat = !formatValidator.test(vm.sms.value.trim());
        }

    }
})();