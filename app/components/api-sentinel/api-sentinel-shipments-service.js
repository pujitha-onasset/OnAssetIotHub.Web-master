(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('ShipmentsService', ShipmentsService);

    ShipmentsService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function ShipmentsService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/shipmentnotifications', {}, {
            getShipments: { method: 'GET', url: HOST.URL + '/rest/1/shipments', isArray: true},
            getShipment:  { method: 'GET', params: { shipmentId: '@shipmentId' }, url: HOST.URL + '/rest/1/shipments/:shipmentId'},
            getShipmentByRef: { method: 'GET', params: { clientGuid: '@clientGuid', referenceNumber: '@referenceNumber' }, url: HOST.URL + '/rest/1/shipments/GetShipmentByReference'},
            createShipment: { method: 'POST', url: HOST.URL + '/rest/1/shipments'},
            updateInfo: { method: 'PUT', params: { shipmentId: '@shipmentId' }, url: HOST.URL + '/rest/1/shipments/editShipment' },
            getStops: { method: 'GET', params: { shipmentId: '@shipmentId' }, url: HOST.URL + '/rest/1/shipmentstops/:shipmentId/stops', isArray: true},
            addStop: { method: 'POST', params: { shipmentId: '@shipmentId' }, url: HOST.URL + '/rest/1/shipmentstops/:shipmentId/stops' },
            addStops: { method: 'POST', params: { shipmentId: '@shipmentId' }, url: HOST.URL + '/rest/1/shipmentstops/:shipmentId' },
            updateStop: { method: 'PUT', params: { shipmentId: '@shipmentId', destinationId: '@destinationId' }, url: HOST.URL + '/rest/1/shipmentstops/:shipmentId/stops/:destinationId' },
            removeStop: { method: 'DELETE', params: { shipmentId: '@shipmentId', destinationId: '@destinationId' }, url: HOST.URL + '/rest/1/shipmentstops/:shipmentId/stops/:destinationId' },
            markStopArrival: { method: 'POST', params: { shipmentId: '@shipmentId', destinationId: '@destinationId' }, url: HOST.URL + '/rest/1/shipmentstops/:shipmentId/stops/:destinationId/markarrived' },
            completeShipment: { method: 'POST', params: { shipmentId: '@shipmentId', destinationId: '@destinationId' }, url: HOST.URL + '/rest/1/shipments/:shipmentId/complete' },
            cancelShipment: { method: 'POST', params: { shipmentId: '@shipmentId', destinationId: '@destinationId' }, url: HOST.URL + '/rest/1/shipments/:shipmentId/cancel' }

        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            getActive: getActive,
            getCompleted: getCompleted,
            getShipment: getShipment,
            getShipmentByRef: getShipmentByRef,
            createShipment: createShipment,
            updateInfo: updateInfo,
            getStops: getStops,
            addStop: addStop,
            addStops: addStops,
            updateStop: updateStop,
            removeStop: removeStop,
            markStopArrival: markStopArrival,
            completeShipment: completeShipment,
            cancelShipment: cancelShipment,
            resource: api
        };

        return service;

        function getActive(client) {
            return api.getShipments({ clientGuid: client.id, status: 'active' });
        }

        function getCompleted(client) {
            return api.getShipments({ clientGuid: client.id, status: 'complete'});
        }

        function getShipment(shipmentId) {
            return api.getShipment({ shipmentId: shipmentId});
        }

        function getShipmentByRef(client, referenceNumber) {
            return api.getShipmentByRef({ clientGuid: client.id, referenceNumber: referenceNumber});
        }

        function createShipment(shipment) {
            return api.createShipment({}, shipment);
        }

        function updateInfo(shipmentInfo) {
            return api.updateInfo({ shipmentId: shipmentInfo.shipmentId }, shipmentInfo);
        }

        function getStops(shipmentId) {
            return api.getStops({ shipmentId: shipmentId});
        }

        function addStop(shipmentId, shipmentStop) {
            return api.addStop({ shipmentId: shipmentId}, shipmentStop);
        }

        function addStops(shipmentId, stops) {
            return api.addStops({ shipmentId: shipmentId}, stops);
        }

        function updateStop(shipmentId, shipmentStop) {
            return api.updateStop({ shipmentId: shipmentId, destinationId: shipmentStop.destinationId}, shipmentStop);
        }

        function removeStop(shipmentId, shipmentStop) {
            return api.removeStop({ shipmentId: shipmentId, destinationId: shipmentStop.destinationId});
        }

        function markStopArrival(shipmentId, shipmentStop) {
            return api.markStopArrival({ shipmentId: shipmentId, destinationId: shipmentStop.destinationId});
        }

        function completeShipment(shipmentId) {
            return api.completeShipment({ shipmentId: shipmentId});
        }

        function cancelShipment(shipmentId) {
            return api.cancelShipment({ shipmentId: shipmentId});
        }

    }

})();