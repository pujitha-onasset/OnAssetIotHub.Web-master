(function() {
    'use strict';

    angular
        .module('api-rls')
        .factory('VisionApiClientsService', VisionApiClientsService);

    VisionApiClientsService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS', 'localStorageService'];
    function VisionApiClientsService($resource, HOST, localStorageService) {
        var apiHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': ''
        };

        var api = $resource(HOST.VISION_URL + '/rest/1/clients', {}, {
            getClient: { method: 'GET', params: { clientGuid: '@clientGuid'}, url: HOST.VISION_URL + '/rest/1/clients/:clientGuid', headers: apiHeaders },
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            getClientByGuid: getClientByGuid,
        };

        return service;

        function getClientByGuid(clientGuid) {
            if (typeof localStorageService.get('visionToken') !== "undefined") {
                apiHeaders.Authorization = 'Bearer ' + localStorageService.get('visionToken').access_token;
            }

            return api.getClient({ clientGuid: clientGuid });
        }

    }

})();