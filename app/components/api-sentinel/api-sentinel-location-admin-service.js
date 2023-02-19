(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('LocationService', LocationService);

    LocationService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];

     function LocationService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/warehouse/location', {}, {
            saveLocation: { method: 'POST', params: {clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/warehouse/location/SaveLocation?clientGuid=:clientGuid' },
            getLocations: { method: 'GET', params: {clientGuid: '@clientGuid'},  url: HOST.URL + '/rest/1/warehouse/location?clientGuid=:clientGuid', isArray: true},
            getLocationsAssets: { method: 'GET', params: {clientGuid: '@clientGuid'},  url: HOST.URL + '/rest/1/warehouse/location/assets?clientGuid=:clientGuid', isArray: true},
            getLocationsAssetsZones: { method: 'GET', params: {clientGuid: '@clientGuid'},  url: HOST.URL + '/rest/1/warehouse/location/assetszones?clientGuid=:clientGuid', isArray: true},
            getLocationAssetsZones: { method: 'GET', params: {clientGuid: '@clientGuid', locationId: '@locationId'},  url: HOST.URL + '/rest/1/warehouse/location/:locationId/assetszones?clientGuid=:clientGuid', isArray: true},
            getLocationAssetsZonesBuffer: {method: 'GET', params: {clientGuid: '@clientGuid',locationId:'@locationId'}, url: HOST.URL + '/rest/1/warehouse/GetAssetsZonesBuffer?clientGuid=:clientGuid&locationId=:locationId', isArray:true},
            getLocation: { method: 'GET', params: { clientGuid: '@clientGuid', locationId: '@locationId'}, url: HOST.URL + '/rest/1/warehouse/location/:locationId?clientGuid=:clientGuid'},
            updateLocation: { method: 'PUT', params: { clientGuid: '@clientGuid', locationId: '@locationId' }, url: HOST.URL + '/rest/1/warehouse/location/:locationId?clientGuid=:clientGuid'},
            removeLocation: { method: 'DELETE', params: { clientGuid:'@clientGuid', locationId: '@locationId' }, url: HOST.URL + '/rest/1/warehouse/location/:locationId?clientGuid=:clientGuid'},
            getZones: { method: 'GET', params: { locationId: '@locationId'}, url: HOST.URL + '/rest/1/warehouse/location/:locationId/zones', isArray: true},
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            saveLocation: saveLocation,
            getLocations: getLocations,
            getLocationsAssets: getLocationsAssets,
            getLocationsAssetsZones: getLocationsAssetsZones,
            getLocationAssetsZones: getLocationAssetsZones,
            getLocationAssetsZonesBuffer: getLocationAssetsZonesBuffer,
            getLocation: getLocation,
            updateLocation: updateLocation,
            removeLocation: removeLocation,
            getZones: getZones,
            resource: api
        };

        return service;

        function saveLocation(client, location) {
            return api.saveLocation({ clientGuid: client.id }, location);
        }

        function getLocations(client) {
            return api.getLocations({ clientGuid: client.id });
        }

        function getLocationsAssets(client) {
            return api.getLocationsAssets({ clientGuid: client.id });
        }

        function getLocationsAssetsZones(client) {
            return api.getLocationsAssetsZones({ clientGuid: client.id });
        }

        function getLocationAssetsZones(client, locationId) {
            return api.getLocationAssetsZones({ clientGuid: client.id, locationId: locationId });
        }

        function getLocationAssetsZonesBuffer(client, locationId) {
            return api.getLocationAssetsZonesBuffer({ clientGuid: client.id, locationId: locationId });
        }

        function getLocation(client, locationId) {
            return api.getLocation({ clientGuid: client.id, locationId: locationId });
        }

        function updateLocation(client, location) {
            return api.updateLocation({clientGuid: client.id, locationId: location.id }, location);
        }

        function removeLocation(client, location) {
            return api.removeLocation({ clientGuid: client.id, locationId: location.id });
        }

        function getZones(location) {
            return api.getZones({ location: location.id });
        }


    }

})();
