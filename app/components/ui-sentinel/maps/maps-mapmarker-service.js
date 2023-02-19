(function () {
    'use strict';

    angular
        .module('ui-sentinel.maps')
        .factory('MapMarkerService', MapMarkerService);

    MapMarkerService.$inject = [];
    function MapMarkerService () {
        var service = {
            createReportMarker: createReportMarker,
            createSelectedMarker: createSelectedMarker
        };
        return service;

        function createReportMarker(map, report) {
            var marker = null;


            google.maps.event.addListener(marker, 'click', function() {

            });

        }

    }
})();