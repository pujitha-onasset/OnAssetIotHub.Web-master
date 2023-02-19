(function () {
    'use strict';

    angular
        .module('ui-sentinel.zones')
        .factory('ZonesFilterService', ZonesFilterService);

    ZonesFilterService.$inject = [];
    function ZonesFilterService() {

        var service = {
            searchText: null,
            filter: filter
        };
        return service;

        function filter(zone) {
            var isTextMatch = true;
            if (service.searchText) {
                isTextMatch = (
                    zone.zoneName.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    zone.deviceType.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    zone.deviceId.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    zone.location.name.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    (zone.zoneNotes !== null && zone.zoneNotes.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1)
                );
            }

            return isTextMatch;
        }
    }

})();