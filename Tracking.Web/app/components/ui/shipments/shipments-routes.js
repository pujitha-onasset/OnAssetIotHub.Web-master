(function() {
    'use strict';

    angular
        .module('tracking.ui.shipments')
        .config(routes);

    routes.$inject = ['$stateProvider'];
    function routes($stateProvider) {
        $stateProvider
            .state('shipments', {
                abstract: true,
                url: '/shipments',
                template: '<ui-view/>',
                data: {
                    showSubNav: true
                }
            })
            .state('shipments.map', {
                url: '/map',
                templateUrl: 'tracking-ui-shipments-map/shipments-map.html',
                params: {
                    shipmentIds: null
                }
            })
            .state('shipments.list', {
                url: '/list',
                templateUrl: 'tracking-ui-shipments-list/shipments-list.html',
                params: {
                    shipmentIds: null
                }
            })
        ;
    }
})();
