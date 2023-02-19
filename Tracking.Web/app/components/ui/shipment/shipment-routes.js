(function() {
    'use strict';

    angular
        .module('tracking.ui.shipment')
        .config(routes);

    routes.$inject = ['$stateProvider'];
    function routes($stateProvider) {
        $stateProvider
            .state('shipment', {
                abstract: true,
                url: '/shipments',
                template: '<ui-view/>',
                params: {
                    shipment: null
                },
                data: {
                    referenceNumber: null,
                    showSubNav: false
                }
            })
            .state('shipment.map', {
                url: '/:shipmentId/map',
                templateUrl: 'tracking-ui-shipment-map/shipment-map.html'
            })
            .state('shipment.reports', {
                url: '/:shipmentId/reports',
                templateUrl: 'tracking-ui-shipment-reports/shipment-reports.html'
            })
        ;
    }
})();
