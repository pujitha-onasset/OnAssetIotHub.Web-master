(function() {
    'use strict';

    angular
        .module('ui-rls.login')
        .config(routes);

    routes.$inject = ['$stateProvider'];
    function routes($stateProvider) {
        $stateProvider
            .state('rlslogin', {
                url: '/rls/login',
                templateUrl: 'ui-rls-login/login.html',
                params: {
                    passwordChanged: false
                },
                data: {
                    isRlsRoute: true,
                    rlsAuthorizationRequired: false
                }
            })
            .state('rlsforgot', {
                url: '/rls/forgot',
                templateUrl: 'ui-rls-login/forgot.html',
                data: {
                    isRlsRoute: true,
                    rlsAuthorizationRequired: false
                }
            })
            .state('rlsreset', {
                url: '/rls/reset',
                templateUrl: 'ui-rls-login/reset.html',
                data: {
                    isRlsRoute: true,
                    rlsAuthorizationRequired: false
                }
            })
        ;
    }

})();
