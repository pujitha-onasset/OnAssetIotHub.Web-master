(function() {
    'use strict';

    angular
        .module('ui-sentinel.fulfillment')
        .config(routes);

    routes.$inject = ['$stateProvider', 'USER_ROLES'];
    function routes($stateProvider, USER_ROLES) {
        $stateProvider
            .state('fulfillment', {
                abstract: true,
                url: '/fulfillment',
                template: '<ui-view/>',
                data: {
                    authorizationRequired: true,
                    authorizedRoles: [
                        USER_ROLES.systemAdmin,
                        USER_ROLES.supportAdmin,
                        USER_ROLES.supportObserver
                    ],
                    pageTitle: 'Fulfillment',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('fulfillment.validate', {
                url: '/validate',
                templateUrl: 'vision-fulfillment/fulfillment-validate.html'
            })
            .state('fulfillment.config', {
                url: '/config',
                templateUrl: 'ui-sentinel-fulfillment/fulfillment-config.html'
            })
            .state('fulfillment.import', {
                url: '/import',
                templateUrl: 'vision-fulfillment/fulfillment-import.html'
            })
        ;
    }
})();