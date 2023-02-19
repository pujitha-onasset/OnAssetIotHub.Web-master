(function () {
    'use strict';

    angular
        .module('ui-sentinel.geofences')
        .factory('GeofencesFilterService', GeofencesFilterService);

    GeofencesFilterService.$inject = [];
    function GeofencesFilterService() {

        var service = {
            searchText: null,
            showRadials: true,
            showPolygons: true,
            filter: filter
        };
        return service;

        function filter(geofence) {
            var isTextMatch = true;
            if (service.searchText) {
                isTextMatch = (
                    geofence.name.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    geofence.address.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    (geofence.comments !== null && geofence.comments.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1)
                );
            }

            var isPolyMatch = service.showPolygons && geofence.type === 'polygon';
            var isRadialMatch = service.showRadials && geofence.type === 'radius';

            return isTextMatch && (isPolyMatch || isRadialMatch);
        }
    }

})();