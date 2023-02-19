(function() {
    'use strict';
    angular
        .module('tracking')
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider', 'localStorageServiceProvider'];
    function config($stateProvider, $urlRouterProvider, localStorageServiceProvider) {
        localStorageServiceProvider
            .setPrefix('tracking')
            .setStorageType('sessionStorage')
            .setNotify(true, true);

        $urlRouterProvider.otherwise("/track");


        $stateProvider
            .state('tracking', {
                abstract: true
            });
    }

})();


