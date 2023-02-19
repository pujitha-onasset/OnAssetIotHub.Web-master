(function() {
    'use strict';

    angular
        .module('ui-sentinel.login')
        .controller('LoginController', LoginController);

    /////////////

    LoginController.$inject = ['$rootScope', '$state', 'SentinelUiSession', 'SentinelAuthenticationService'];
    function LoginController($rootScope, $state, SentinelUiSession, SentinelAuthenticationService) {
        var vm = {
            username: {
                value: null,
                isPristine: true,
                hasError: function () {
                    return  this.errors.isBlank;
                },
                errors: {
                    isBlank: true
                },
                validate: function() {
                    this.isPristine = false;
                    this.errors.isBlank = !this.value;
                }
            },
            password: {
                value: null,
                isPristine: true,
                hasError: function () {
                    return  this.errors.isBlank;
                },
                errors: {
                    isBlank: true
                },
                validate: function() {
                    this.isPristine = false;

                    if (!this.value) {
                        this.errors.isBlank = true;
                    }
                    else {
                        this.value = this.value.trim();
                        this.errors.isBlank = this.value === '';
                    }
                }
            },
            inProcess: false,
            login: login,
            loginFailed: false,
            loginSuspend: false,
            serverError: false,
            date: new Date(),
        };
        activate();
        return vm;

        function activate() {
        }

        function login() {
            SentinelUiSession.clear();
            vm.inProcess = true;
            vm.loginFailed = false;
            vm.serverError = false;

            $('#btn-login').blur();

            vm.username.validate();
            vm.password.validate();

            if (vm.username.hasError() || vm.password.hasError()) {
                vm.inProcess = false;
                vm.loginFailed = true;
                return;
            }

            $rootScope.loading = true;
            var promise = SentinelAuthenticationService.getTokenUsingClientCredentials(vm.username.value.trim(), vm.password.value.trim()).$promise;
            promise.then(
                function (result) {
                    vm.inProcess = false;
                    SentinelUiSession.create(result, onSessionCreated, onSessionError);
                },
                function (error) {
                    vm.inProcess = false;
                    if(error.status === 400 && error.data.error ==="suspended_client"){
                      vm.loginSuspend = true;
                      vm.loginFailed = false;
                    }else{
                      vm.loginFailed = error.status === 400; 
                      vm.loginSuspend = false;
                    }                   
                    vm.serverError = error.status !== 400;
                    SentinelUiSession.clear();
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function onSessionCreated() {
            $state.go('home');
        }

        function onSessionError() {
        }
    }



})();