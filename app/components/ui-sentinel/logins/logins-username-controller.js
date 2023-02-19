(function() {
    'use strict';

    angular
        .module('ui-sentinel.logins')
        .controller('LoginsUsernameController', LoginsUsernameController);

    LoginsUsernameController.$inject = ['$rootScope', '$state', '$stateParams', 'SentinelUiSession', 'LoginsApiService', 'FeedbackService'];
    function LoginsUsernameController($rootScope, $state, $stateParams, SentinelUiSession, LoginsApiService, FeedbackService) {
        var vm = {
            login: null,
            lastLoginAge: null,
            username: {
                value: null,
                isPristine: true,
                hasError: function() {
                    return this.errors.isBlank || this.errors.isBadFormat || this.errors.isDuplicate;
                },
                errors: {
                    isBlank: true,
                    isBadFormat: false,
                    isDuplicate: false
                },
                validate: validateUsername
            },
            feedback: FeedbackService,
            hasPermission: {
                toSave: false,
            },
            actions: {
                close: close,
                reset: reset,
                submit: submit,
            },
            session: SentinelUiSession
        };
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
            reset();
        }

        function close() {
            vm.login = null;
            reset();
            if (typeof $stateParams.referrer === 'undefined' || $stateParams.referrer === null) {
                $state.go('logins.list');
            }
            else {
                $state.go($stateParams.referrer, $stateParams.referrerParams);
            }
        }

        function reset() {
            setPermissions();

            vm.lastLoginAge = '';
            vm.username.value = null;

            vm.username.isPristine = true;
            vm.username.errors.isBlank = true;
            vm.username.errors.isBadFormt = false;
            vm.username.errors.isDuplicate = false;
        }

        function setPermissions() {
            vm.hasPermission.toSave = true;
        }

        function submit() {
            vm.feedback.clear();
            vm.username.validate();

            if (vm.username.hasError()) {
                return;
            }

            $rootScope.loading = true;
            var promise = LoginsApiService.changeCurrentUserName(SentinelUiSession.user, vm.username.value).$promise;

            promise.then(
                function (result) {
                    vm.login = result;
                    vm.feedback.addSuccess('The new username ' + vm.username.value + ' has been saved');

                    reset();
                },
                function (error) {
                    if (error.status === -1) {
                        vm.feedback.addError('Unable to connect to server.  Please try again later.');
                        return;
                    }

                    if (error.status === 400 && error.data.message === 'User already exists') {
                        vm.username.errors.isDuplicate = true;
                        return;
                    }
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function validateUsername() {
            vm.username.isPristine = false;
            vm.username.errors.isDuplicate = false;

            vm.username.errors.isBlank = !vm.username.value;
            if (vm.username.errors.isBlank)
                return;

            vm.username.errors.isBadFormat = false;
        }
    }
})();