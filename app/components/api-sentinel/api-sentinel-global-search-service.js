(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('GlobalSearchService', GlobalSearchService);

    GlobalSearchService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];

     function GlobalSearchService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/search', {}, {
            GetSearchCountItemsByType: { method: 'GET', params: {clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/search/GetSearchCountItemsByType?accountId=:clientGuid' },
            ShipmentSearch: { method: 'GET', params: {clientGuid: '@clientGuid', shipmentDescription: '@shipmentDescription'}, url: HOST.URL + '/rest/1/search/ShipmentSearch?accountId=:clientGuid&shipmentDescription=:shipmentDescription', isArray:true },
            LocationSearch: { method: 'GET', params: {clientGuid: '@clientGuid', locationSearchDescription: '@locationSearchDescription'}, url: HOST.URL + '/rest/1/search/LocationSearch?accountId=:clientGuid&locationSearchDescription=:locationSearchDescription', isArray:true },
            DeviceSearch: { method: 'GET', params: {clientGuid: '@clientGuid', deviceDescription: '@deviceDescription'}, url: HOST.URL + '/rest/1/search/DeviceSearch?accountId=:clientGuid&deviceDescription=:deviceDescription', isArray:true }
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            GetSearchCountItemsByType: GetSearchCountItemsByType,
            ShipmentSearch: ShipmentSearch,
            LocationSearch: LocationSearch,
            DeviceSearch: DeviceSearch,
            resource: api
        };

        return service;

        function GetSearchCountItemsByType(client) {
            return api.GetSearchCountItemsByType({ clientGuid: client.id });
        }

        function ShipmentSearch(client, shipmentDescription) {
            return api.ShipmentSearch({ clientGuid: client.id, shipmentDescription: shipmentDescription });
        }

        function LocationSearch(client, locationSearchDescription) {
            return api.LocationSearch({ clientGuid: client.id, locationSearchDescription: locationSearchDescription });
        }

        function DeviceSearch(client, deviceDescription) {
            return api.DeviceSearch({ clientGuid: client.id, deviceDescription: deviceDescription });
        }

    }

})();
