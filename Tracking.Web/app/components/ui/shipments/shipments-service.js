(function() {
    'use strict';

    angular
        .module('tracking.ui.shipments')
        .factory('ShipmentsService', ShipmentsService);

    ShipmentsService.$inject = ['TrackingApiService'];
    function ShipmentsService(TrackingApiService) {
        
        var service = {
            shipments: [],
            loadShipment: loadShipment,
            selected: null,
            clear: clear,
            get: get
        };
        activate();
        return service;
        
        /////////////////////////
        
        function activate() {
            clear();
        }
        
        function loadShipment(shipmentId) {
            if (!shipmentId) {
                return;
            }

            if (_.findIndex(service.shipments, { shipmentId: shipmentId}) > -1 ) {
                return;
            }

            var promise = TrackingApiService.getShipment(shipmentId).$promise;
            promise.then(
                function (shipment) {
                    var latestPromise = TrackingApiService.getLatestShipmentReport(shipmentId).$promise;
                    latestPromise.then(
                        function (report) {
                            shipment.latestReport = report;
                            service.shipments.push(shipment);
                        },
                        function (error) {
                            shipment.latestReport = null;
                            service.shipments.push(shipment);
                        }
                    );
                },
                function (error) {
                    console.log(error);
                }
            );
        }
        
        function clear() {
            service.shipments = [];
            service.selected = null;
        }

        function get(shipmentId) {
            var result = null;
            _.forEach(service.shipments, function (shipment) {
                if (shipment.shipmentId === shipmentId) {
                    result = shipment;
                    return false;
                }
            });
            return result;
        }
    }

})();