(function () {
    'use strict';

    angular
        .module('ui-sentinel.home')
        .config(routes);

    routes.$inject = ['$stateProvider'];
    function routes($stateProvider) {
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'ui-sentinel-home/home.html',
                data: {
                    authorizationRequired: true
                }
            })
            .state('home-admin', {
                url: '/home-admin',
                templateUrl: 'ui-sentinel-home/home-admin.html',
                data: {
                    authorizationRequired: true
                }
            })
        ;
    }

})();