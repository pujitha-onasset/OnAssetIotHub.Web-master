(function() {
    'use strict';

    angular
        .module('ui-rls.login')
        .controller('RlsLoginController', RlsLoginController);

    /////////////

    RlsLoginController.$inject = ['$rootScope', '$state', 'RlsUiSession','SentinelUiSession', 'SentinelAuthenticationService', 'VisionApiTokenService', 'VisionApiUsersService', 'VisionApiClientsService', 'localStorageService'];
    function RlsLoginController($rootScope, $state, RlsUiSession,SentinelUiSession, SentinelAuthenticationService, VisionApiTokenService, VisionApiUsersService, VisionApiClientsService, localStorageService) {
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
            serverError: false,
            date: new Date(),
        };
        activate();
        return vm;

        function activate() {
        }

        function login() {
            RlsUiSession.clear();
            localStorageService.remove('visionToken');
            localStorageService.remove('visionUser');
            localStorageService.remove('visionClient');

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
            var promise = VisionApiTokenService.getTokenUsingResourceOwner(vm.username.value.trim(), vm.password.value.trim()).$promise;
            promise.then(
                function (result) {
                    localStorageService.set('visionToken', result);

                    var userPromise = VisionApiUsersService.getCurrentUser().$promise;
                    userPromise.then(
                        function (result) {
                            localStorageService.set('visionUser', result);

                            var clientPromise = VisionApiClientsService.getClientByGuid(result.clientGuid).$promise;
                            clientPromise.then(function(result) {
                                localStorageService.set('visionClient', result);

                                var oApromise = SentinelAuthenticationService.getTokenUsingClientCredentials("sreddyoaieng", "Vuhavoui8@").$promise;
                                oApromise.then(
                                    function (result) {
                                        vm.inProcess = false;
                                        RlsUiSession.create(result, onSessionCreated, onSessionError, true);
                                        //SentinelUiSession.createNoclear(result);
                                    },
                                    function (error) {
                                        vm.inProcess = false;

                                        vm.loginFailed = error.status === 400;
                                        vm.serverError = error.status !== 400;
                                        RlsUiSession.clear();
                                    }
                                ).finally(function(){
                                    $rootScope.loading = false;
                                });
                            },
                            function (error) {
                                console.log(error);
                                $rootScope.loading = false;
                            });
                        },
                        function (error) {
                            console.log(error);
                            $rootScope.loading = false;
                        }
                    );
                },
                function (error) {
                    var oApromise = SentinelAuthenticationService.getTokenUsingClientCredentials(vm.username.value.trim(), vm.password.value.trim()).$promise;
                    oApromise.then(
                        function (result) {
                            vm.inProcess = false;
                            RlsUiSession.create(result, onSessionCreated, onSessionError);
                            //SentinelUiSession.createNoclear(result);
                        },
                        function (error) {
                            vm.inProcess = false;

                            vm.loginFailed = error.status === 400;
                            vm.serverError = error.status !== 400;
                            RlsUiSession.clear();
                        }
                    ).finally(function(){
                        $rootScope.loading = false;
                    });
                }
            );
        }

        function onSessionCreated() {
            $state.go('rlshome');
        }

        function onSessionError() {
        }
    }



})();