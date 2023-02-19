(function() {
    'use strict';

    angular
        .module('api-rls')
        .factory('VisionApiUsersService', VisionApiUsersService);

    VisionApiUsersService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS', 'localStorageService'];
    function VisionApiUsersService($resource, HOST, localStorageService) {
        var apiHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': ''
        };

        var api = $resource(HOST.VISION_URL + '/rest/1/users', {}, {
            current: { method: 'GET', url: HOST.VISION_URL + '/rest/1/users/current', headers: apiHeaders },
            completeShipment: { method: 'POST',params: { shipmentId: '@shipmentId' }, url: HOST.VISION_URL + '/rest/1/shipments/:shipmentId/complete', headers: apiHeaders }
        });

        var apiShipment = $resource(HOST.VISION_URL + '/rest/1/users', {}, {
            
        });

        var service = {
            getCurrentUser: getCurrent,
            completeShipment:completeShipment
        };

        return service;

        function getCurrent() {
            if (typeof localStorageService.get('visionToken') !== "undefined") {
                apiHeaders.Authorization = 'Bearer ' + localStorageService.get('visionToken').access_token;
            }

            return api.current();
        }

        function completeShipment(shipmentId) {
            if (typeof localStorageService.get('visionToken') !== "undefined") {
                apiHeaders.Authorization = 'Bearer ' + localStorageService.get('visionToken').access_token;
            }

            return api.completeShipment({shipmentId:shipmentId});
        }
    }

})();