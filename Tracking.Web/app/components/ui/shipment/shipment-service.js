(function() {
    'use strict';

    angular
        .module('tracking.ui.shipment')
        .factory('ShipmentService', ShipmentService);

    ShipmentService.$inject = ['TrackingApiService'];
    function ShipmentService(TrackingApiService) {
        
        var service = {
            shipment: null,
            loadShipment: loadShipment,
            clear: clear
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

            var promise = TrackingApiService.getShipment(shipmentId).$promise;
            promise.then(
                function (shipment) {
                    service.shipment = shipment;
                },
                function (error) {
                    console.log(error);
                }
            );
        }
        
        function clear() {
            service.shipment = null;
        }
    }

})();