(function () {
    'use strict';

    angular
        .module('tracking.ui.common')
        .factory('CommonMapService', CommonMapService);

    CommonMapService.$inject = [];
    function CommonMapService() {

        var service = {
            getMapTypes: mapTypes,
            getMapZooms: mapZooms
        };
        return service;

        ////////

        function mapTypes() {
            return {
                hybrid: {
                    name: 'Hybrid',
                    type: google.maps.MapTypeId.HYBRID
                },
                roadmap: {
                    name: 'Roadmap',
                    type: google.maps.MapTypeId.ROADMAP
                },
                satellite: {
                    name: 'Satellite',
                    type: google.maps.MapTypeId.SATELLITE
                },
                terrain: {
                    name: 'Terrain',
                    type: google.maps.MapTypeId.TERRAIN
                }
            };
        }

        function mapZooms() {
            return {
                world: {
                    center: { lat: 19.0, lng: 20.45},
                    zoomLevel: 2
                },
                northAmerica: {
                    center: { lat: 34.8, lng: -98.48},
                    zoomLevel: 4
                },
                southAmerica: {
                    center: { lat: -20.245, lng: -62.935},
                    zoomLevel: 3
                },
                europe: {
                    center: { lat: 48.069, lng: 12.283},
                    zoomLevel: 4
                },
                middleEast: {
                    center: { lat: 29.6, lng: 67.2},
                    zoomLevel: 4
                },
                farEast: {
                    center: { lat: 29.2, lng: 119.444},
                    zoomLevel: 4
                },
                southPacific: {
                    center: { lat: -14.413, lng: 125.186},
                    zoomLevel: 3
                }
            };
        }
    }
})();