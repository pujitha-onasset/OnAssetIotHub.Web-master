(function() {
    'use strict';

    angular
        .module('ui-sentinel.login')
        .config(routes);

    routes.$inject = ['$stateProvider'];
    function routes($stateProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'ui-sentinel-login/login.html',
                params: {
                    passwordChanged: false
                },
                data: {
                    authorizationRequired: false
                }
            })
            .state('forgot', {
                url: '/forgot',
                templateUrl: 'ui-sentinel-login/forgot.html',
                data: {
                    authorizationRequired: false
                }
            })
            .state('reset', {
                url: '/reset',
                templateUrl: 'ui-sentinel-login/reset.html',
                data: {
                    authorizationRequired: false
                }
            })
        ;
    }

})();
