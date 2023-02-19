(function () {
    'use strict';

    angular
        .module('ui-sentinel.simulators')
        .config(routes);

    routes.$inject = ['$stateProvider'];
    function routes($stateProvider) {
        $stateProvider
            .state('simulators', {
                abstract: true,
                url: '/simulators',
                template: '<ui-view/>',
                data: {
                    authorizationRequired: true,
                    pageTitle: 'Simulators',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('simulators.warehouse', {
                url: '/warehouse',
                templateUrl: 'ui-sentinel-simulators/warehouse-simulator.html',
                data: {
                    subTitle: 'Warehouse'
                }
            })
            .state('simulators.separation', {
                url: '/separation',
                templateUrl: 'ui-sentinel-simulators/separation-simulator.html',
                data: {
                    subTitle: 'Separation'
                },
                params: {
                    imei: null,
                    lastReport: null
                }
            })
            .state('simulators.nearest', {
                url: '/nearest',
                templateUrl: 'ui-sentinel-simulators/nearest-simulator.html',
                data: {
                    subTitle: 'Nearest Sentry'
                },
                params: {
                    mac: null,
                    lastReport: null
                }
            })
        ;
    }

})();