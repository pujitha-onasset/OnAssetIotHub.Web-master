(function() {
    'use strict';

    angular
        .module('ui-sentinel.login')
        .controller('ResetController', ResetController);

    /////////////

    ResetController.$inject = ['$scope', '$state','LoginsApiService', 'FeedbackService'];
    function ResetController($scope, $state, LoginsApiService, FeedbackService) {
        var vm = {
            email: {
                value: null,
                isPristine: true,
                hasError: function() {
                    return this.errors.isBlank || this.errors.isBadFormat;
                },
                errors: {
                    isBlank: true,
                    isBadFormat: false
                },
                validate: validateEmail
            },
            password: {
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
                validate: validatePassword
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
            token: {
                value: null,
                isPristine: true,
                hasError: function() {
                    return this.errors.isBlank || this.errors.isExpired;
                },
                errors: {
                    isBlank: true,
                    isExpired: false
                },
                validate: validateToken
            },
            feedback: FeedbackService,
            submitToken: submitToken,
            requestAnotherToken: requestAnotherToken,
            backToLogin: backToLogin
        };
        activate();
        return vm;

        function activate() {
        }


        function submitToken() {
            $('#btn-submitToken').blur();
            vm.feedback.clear();
            validateEmail();
            validatePassword();
            validateToken();
            validateConfirmation();

            if (vm.email.hasError() || vm.password.hasError() || vm.token.hasError() || vm.confirmation.hasError())
                return;

            var promise = LoginsApiService.confirmResetToken(vm.email.value.trim(), vm.token.value.trim(), vm.password.value.trim()).$promise;
            promise.then(
                function (result) {
                    $state.go('login', { passwordChanged: true });
                },
                function (error) {
                    if (error.status === -1) {
                        vm.feedback.addError('Unable to connect to server.  Please try again later.');
                        return;
                    }

                    if (error.status === 404 && error.data.message === 'Invalid or expired reset token') {
                        vm.token.errors.isExpired = true;
                        return;
                    }

                    if (error.status === 404 && error.data.message === 'The new password cannot be the same as one of your last four passwords') {
                        vm.password.errors.isRepeat = true;
                        return;
                    }

                    vm.feedback.addError('Unable to reset the account.  Please try again later or call support.');
                }
            );
        }

        function backToLogin() {
            $state.go('login');
        }

        function requestAnotherToken() {
            vm.emailSent = false;

            vm.password.value = null;
            vm.password.isPristine = true;
            vm.password.errors.isBlank = true;
            vm.password.errors.isBadFormat = false;

            vm.token.value = null;
            vm.token.isPristine = true;
            vm.token.errors.isBlank = true;
            vm.token.errors.isExpired = false;

            vm.confirmation.value = null;
            vm.confirmation.isPristine = true;
            vm.confirmation.errors.isBlank = true;
            vm.confirmation.errors.isNotMatching = false;
        }

        function validateEmail() {
            vm.email.isPristine = false;
            vm.email.errors.isBadFormat = false;

            vm.email.errors.isBlank = !vm.email.value;
            if (vm.email.errors.isBlank)
                return;

            var formatValidator = /^([\w+-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/i;
            vm.email.errors.isBadFormat = !formatValidator.test(vm.email.value.trim());
        }

        function validatePassword() {
            vm.password.isPristine = false;
            vm.password.errors.isRepeat = false;
            vm.password.errors.isBadFormat = false;

            vm.password.errors.isBlank = !vm.password.value;
            if (vm.password.errors.isBlank)
                return;

            var formatValidator = /((?=.*\d)(?=.*[A-Z])(?=.*\W).{8,})/;
            vm.password.errors.isBadFormat = !formatValidator.test(vm.password.value.trim());
        }

        function validateConfirmation() {
            vm.confirmation.isPristine = false;
            vm.confirmation.errors.isNotMatching = false;

            vm.confirmation.errors.isBlank = !vm.confirmation.value;
            if (vm.confirmation.errors.isBlank)
                return;

            vm.confirmation.errors.isNotMatching = vm.password.value !== vm.confirmation.value;
        }

        function validateToken() {
            vm.token.isPristine = false;
            vm.token.errors.isExpired = false;

            vm.token.errors.isBlank = !vm.token.value;

        }
    }

})();