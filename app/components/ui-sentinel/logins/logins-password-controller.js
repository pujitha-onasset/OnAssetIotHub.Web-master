(function() {
    'use strict';

    angular
        .module('ui-sentinel.logins')
        .controller('LoginsPasswordController', LoginsPasswordController);

    LoginsPasswordController.$inject = ['$rootScope', '$state', '$stateParams', 'SentinelUiSession', 'LoginsApiService', 'FeedbackService', 'AccountApiService', 'USER_ROLES'];
    function LoginsPasswordController($rootScope, $state, $stateParams, SentinelUiSession, LoginsApiService, FeedbackService, AccountApiService, USER_ROLES) {
        var vm = {
            currentPassword: {
                value: null,
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank || this.errors.isNotCurrent;
                },
                errors: {
                    isBlank: true,
                    isNotCurrent: false
                },
                validate: validateCurrentPassword
            },
            newPassword: {
                value: null,
                isPristine: true,
                hasError: function() {
                    return this.errors.isBlank || this.errors.isBadFormat || this.errors.isRepeat;
                },
                errors: {
                    isBlank: true,
                    isBadFormat: false,
                    isRepeat: false
                },
                validate: validateNewPassword
            },
            confirmation: {
                value: null,
                isPristine: true,
                hasError: function() {
                    return this.errors.isBlank || this.errors.isNotMatching;
                },
                errors: {
                    isBlank: true,
                    isNotMatching: false
                },
                validate: validateConfirmation
            },
            feedback: FeedbackService,
            hasPermission: {
                toChangePassword: false
            },
            actions: {
                close: close,
                submit: submit,
                reset: reset
            },
            session: SentinelUiSession
        };
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                //TODO: do something to either prevent the change while on this page OR go somewhere else
            });
            setPermissions();
        }

        function close() {
            $state.go($stateParams.referrer, $stateParams.referrerParams);
        }

        function reset() {
            vm.currentPassword.value = null;
            vm.currentPassword.isPristine = true;
            vm.currentPassword.errors.isBlank = true;
            vm.currentPassword.errors.isNotCurrent = false;

            vm.newPassword.value = null;
            vm.newPassword.isPristine = true;
            vm.newPassword.errors.isBlank = true;
            vm.newPassword.errors.isBadFormat = false;
            vm.newPassword.errors.isRepeat = false;

            vm.confirmation.value = null;
            vm.confirmation.isPristine = true;
            vm.confirmation.errors.isBlank = true;
            vm.confirmation.errors.isNotMatching = false;

            //$('#currentPwd').focus();
        }


        function setPermissions() {
            vm.hasPermission.toCreate = vm.hasPermission.toGrantAccess = vm.hasPermission.toRevokeAccess =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isSupportAdmin ||
                SentinelUiSession.user.isAccountAdmin;

            vm.hasPermission.toSave =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isSupportAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;

        }


        function submit() {
            $('#btn-submit').blur();
            vm.feedback.clear();
            validateCurrentPassword();
            validateNewPassword();
            validateConfirmation();

            if (vm.currentPassword.hasError() || vm.newPassword.hasError() || vm.confirmation.hasError())
                return;

            $rootScope.loading = true;
            var promise = LoginsApiService.changeCurrentUserPassword(SentinelUiSession.user, vm.currentPassword.value.trim(), vm.newPassword.value.trim()).$promise;
            promise.then(
                function(result) {
                    reset();

                    SentinelUiSession.clear();
                    $state.go('login', { passwordChanged: true });
                },
                function (error) {
                    if (error.status === -1) {
                        vm.feedback.addError('Unable to connect to server.  Please try again later.');
                        return;
                    }

                    if (error.status === 404 && error.data.message === 'Incorrect password.') {
                        vm.currentPassword.errors.isNotCurrent = true;
                        return;
                    }


                    if (error.status === 404 && error.data.message === 'The new password cannot be the same as one of your last four passwords') {
                        vm.newPassword.errors.isRepeat = true;
                        return;
                    }

                    vm.feedback.addError('Unable to reset the account.  Please try again later or call support.');
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function validateCurrentPassword() {
            vm.currentPassword.isPristine = false;
            vm.currentPassword.errors.isNotCurrent = false;

            vm.currentPassword.errors.isBlank = !vm.currentPassword.value;
            if (vm.currentPassword.errors.isBlank)
                return;

        }

        function validateNewPassword() {
            vm.newPassword.isPristine = false;
            vm.newPassword.errors.isRepeat = false;

            vm.newPassword.errors.isBlank = !vm.newPassword.value;
            if (vm.newPassword.errors.isBlank)
                return;

            vm.newPassword.value = vm.newPassword.value.trim();

            var formatValidator = /((?=.*\d)(?=.*[A-Z])(?=.*\W).{8,})/;
            vm.newPassword.errors.isBadFormat = !formatValidator.test(vm.newPassword.value);
        }

        function validateConfirmation() {
            vm.confirmation.isPristine = false;

            vm.confirmation.errors.isBlank = !vm.confirmation.value;
            if (vm.confirmation.errors.isBlank)
                return;

            vm.confirmation.errors.isNotMatching = vm.newPassword.value !== vm.confirmation.value;
        }
    }
})();