(function() {
    'use strict';
    
    angular
        .module('api-sentinel')
        .factory('RadialGeofencesService', RadialGeofencesService);

    RadialGeofencesService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function RadialGeofencesService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/radialgeofences', {}, {
            addGeofence: { method: 'POST' },
            getGeofences: { method: 'GET', isArray: true},
            getGeofence: { method: 'GET', params: { geofenceId: '@geofenceId'}, url: HOST.URL + '/rest/1/radialgeofences/:geofenceId'},
            updateGeofence: { method: 'PUT', params: { geofenceId: '@geofenceId' }, url: HOST.URL + '/rest/1/radialgeofences/:geofenceId'},
            removeGeofence: { method: 'DELETE', params: { geofenceId: '@geofenceId' }, url: HOST.URL + '/rest/1/radialgeofences/:geofenceId'},
            getAlarms: { method: 'GET', params: { geofenceId: '@geofenceId'}, url: HOST.URL + '/rest/1/radialgeofences/:geofenceId/alarms', isArray: true}
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            addGeofence: addGeofence,
            getGeofences: getGeofences,
            getGeofence: getGeofence,
            updateGeofence: updateGeofence,
            removeGeofence: removeGeofence,
            getAlarms: getAlarms,
            resource: api
        };

        return service;

        function addGeofence(client, geofence) {
            return api.addGeofence({ clientGuid: client.id }, geofence);
        }

        function getGeofences(client) {
            return api.getGeofences({ clientGuid: client.id });
        }

        function getGeofence(geofenceId) {
            return api.getGeofence({ geofenceId: geofenceId });
        }

        function updateGeofence(geofence) {
            return api.updateGeofence({ geofenceId: geofence.id }, geofence);
        }

        function removeGeofence(geofence) {
            return api.removeGeofence({ geofenceId: geofence.id });
        }

        function getAlarms(geofence) {
            return api.getAlarms({ geofenceId: geofence.id });
        }
    }

})();