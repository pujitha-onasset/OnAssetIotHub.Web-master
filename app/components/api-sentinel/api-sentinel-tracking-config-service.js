(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('TrackingConfigService', TrackingConfigService);

    TrackingConfigService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function TrackingConfigService($resource, HOST) {
        var api = $resource(HOST.URL + '/rest/1/tracking/clients', {}, {
            getConfig: { method: 'GET', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/admin/accounts/:clientGuid'},
            updateConfig: { method: 'PUT', params: { clientGuid: '@clientGuid' }, url: HOST.URL + '/rest/1/tracking/clients/:clientGuid'},
            deleteConfig: { method: 'DELETE', params: { clientGuid: '@clientGuid' }, url: HOST.URL + '/rest/1/tracking/clients/:clientGuid'},
            addConfig: { method: 'POST', params: { clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/tracking/clients'}
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            getConfig: getConfig,
            updateConfig: updateConfig,
            deleteConfig: deleteConfig,
            addConfig: addConfig,
            resource: api
        };

        return service;

        function addConfig(trackingConfig) {
            return api.addConfig(trackingConfig);
        }

        function deleteConfig(client) {
            return api.deleteConfig({ clientGuid: client.id });
        }

        function getConfig(client) {
            return api.getConfig({ clientGuid: client.id });
        }

        function updateConfig(client, trackingConfig) {
            return api.updateConfig({ clientGuid: client.id }, trackingConfig);
        }
    }

})();