(function () {
    'use strict';

    angular
        .module('ui-sentinel.locations')
        .factory('LocationsFilterService', LocationsFilterService);

    LocationsFilterService.$inject = [];
    function LocationsFilterService() {

        var service = {
            searchText: null,
            filter: filter
        };
        return service;

        function filter(location) {
            var isTextMatch = true;
            if (service.searchText) {
                isTextMatch = (
                    location.name.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    location.address.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    (location.description !== null && location.description.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1)
                );
            }

            return isTextMatch;
        }
    }

})();
