    //.config(function(uiGmapGoogleMapApiProvider) {
    //    uiGmapGoogleMapApiProvider.configure({
    //        key: 'AIzaSyB-vRtyKEKAC5GOrOIt4W0oe_P7qMyVSxA',
    //        v: '3.20',
    //        libraries: 'geometry, visualization'
    //    });
    //})

(function() {
    'use strict';
    angular
        .module('sentinel.gateway.web')
        .config(config);

    config.$inject = ['$stateProvider','$urlRouterProvider', '$locationProvider', 'localStorageServiceProvider'];
    function config($stateProvider ,$urlRouterProvider, $locationProvider, localStorageServiceProvider) {
        
    
        localStorageServiceProvider
            .setPrefix('sentinel.api.web')
            .setStorageType('sessionStorage')
            .setNotify(true, true);

        $urlRouterProvider.otherwise('/login'); // /login

        // $stateProvider
        //     .state('index', {
        //         abstract: true,
        //         data: {
        //             authorizationRequired: true
        //         }
        //     });
    }

})();


