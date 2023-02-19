(function() {
    'use strict';

    angular
        .module('api-rls')
        .factory('CountryService', CountryService);

    CountryService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];

     function CountryService($resource, HOST) {

        var api = $resource(HOST.URL + '/rest/1/rlscatalog', {}, {
            getCountries: { method: 'GET', url: HOST.URL + '/rest/1/rlscatalog/GetCountryCatalog', isArray: true}
        });

        var service = {
            getCountries: getCountries
        };

        return service;

        function getCountries() {
            return api.getCountries();
        }

    }

})();
