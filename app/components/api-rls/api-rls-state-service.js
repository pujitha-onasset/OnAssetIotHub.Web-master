(function() {
    'use strict';

    angular
        .module('api-rls')
        .factory('StateService', StateService);

    StateService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];

     function StateService($resource, HOST) {

        var api = $resource(HOST.URL + '/rest/1/rlscatalog', {}, {
            getListStates: { method: 'GET', url: HOST.URL + '/rest/1/rlscatalog/GetStateListByCountryCode', isArray: true}
        });

        var service = {
            getListStates: getListStates
        };

        return service;

        function getListStates(countryCode) {
            return api.getListStates({"countryCode":countryCode});
        }

    }

})();
