(function () {
    'use strict';

    angular
        .module('ui-sentinel.geofences')
        .controller('GeofencesMapController', GeofencesMapController);

    GeofencesMapController.$inject = ['$rootScope', '$scope', '$state', 'localStorageService', 'GeofencesDataService', 'GeofencesFilterService', 'MapsConstants'];
    function GeofencesMapController($rootScope, $scope, $state, localStorageService, GeofencesDataService, GeofencesFilterService, MapsConstants) {
        var vm = {
            listLimit: 10,
            map: null,
            mapType: MapsConstants.mapTypes.hybrid,
            mapTypes: MapsConstants.mapTypes,
            mapZooms: MapsConstants.zooms,
            filterService: GeofencesFilterService,
            geofenceService: GeofencesDataService,            
            markers: [],
            selected: null,
            hover: null,
            applyFilter: applyFilter,
            isMarkerVisible: isMarkerVisible,
            visibleMarkerCount: 0,
            actions: {
                map: {
                    setZoom: setZoom,
                    showMapData: showMapData,
                    setType: setType
                },
                geofence: {
                    panTo: panToMarker,
                    unSelect: unSelect,
                    select: select,
                    edit: edit
                }
            }
        };

        var icons = MapsConstants.icons.geofences;
        var shapeStyles = MapsConstants.shapes;

        var infoWindow = new google.maps.InfoWindow({
            content: document.getElementById('hoverLabel'),
            disableAutoPan: true
        });

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////


        function activate() {
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'geofences.map') {
                    unSelect(vm.selected);
                    vm.geofenceService.load();
                }
            });

            var mapCenter = localStorageService.get('mapCenter');
            var mapCenterLat = localStorageService.get('mapCenterLat');
            var mapCenterLng = localStorageService.get('mapCenterLng');
            var mapZoom = localStorageService.get('mapZoom');

            vm.map = new google.maps.Map(document.getElementById('geofencesMap'), {
                zoom: mapZoom || vm.mapZooms.world.zoomLevel,
                center: mapCenter || vm.mapZooms.world.center,
                mapTypeId: vm.mapType.type,
                mapTypeControl: false
            });

            var geofenceTool = document.getElementById('geofenceTool');
            vm.map.controls[google.maps.ControlPosition.TOP_LEFT].push(geofenceTool);

            google.maps.event.addListener(vm.map, 'idle', handleIdle);

            $scope.$watch(
                function() {
                    return vm.geofenceService.all;
                },
                function (value) {
                    refreshMarkers();
                }, true
            );
            $scope.$watch(
                function() {
                    return vm.filterService;
                },
                function () {
                    applyFilter();
                }, true
            );

            refreshMarkers();
        }

        function addMarkerListeners(marker) {
            google.maps.event.addListener(marker, 'click', function() {
                select(marker);
                $scope.$apply();
            });

            google.maps.event.addListener(marker, 'mouseover', function() {
                marker.setIcon(icons.hover);
                marker.shape.setOptions(shapeStyles.hover);
                vm.hover = marker;
                $scope.$apply();
                infoWindow.open(vm.map, marker);
            });

            google.maps.event.addListener(marker, 'mouseout', function() {
                marker.setIcon(vm.selected === vm.hover ? icons.selected : (marker.geofence.isRadial ? icons.radial : icons.polygon));
                marker.shape.setOptions(vm.selected === vm.hover ? shapeStyles.selected : (marker.geofence.isRadial ? shapeStyles.radial : shapeStyles.polygon));
                vm.hover = null;
                $scope.$apply();
                infoWindow.close();
            });
        }

        function applyFilter() {
            vm.visibleMarkerCount = 0;

            if (vm.selected && !vm.filterService.showRadials && vm.selected.geofence.type === 'radius') {
                unSelect();
            }

            if (vm.selected && !vm.filterService.showPolygons && vm.selected.geofence.type === 'polygon') {
                unSelect();
            }

            _.forEach(vm.markers, function(marker) {
                marker.setVisible(vm.filterService.filter(marker.geofence));
                marker.shape.setVisible(vm.filterService.filter(marker.geofence));

                vm.visibleMarkerCount = marker.getVisible() ? vm.visibleMarkerCount + 1 : vm.visibleMarkerCount;
            });
        }

        function drawShapes() {
            var bounds = vm.map.getBounds();
            var zoom = vm.map.getZoom();
            _.forEach(vm.markers, function (marker) {
                if (!marker.shape) {
                    return false;
                }

                if (marker.getMap() === null) {
                    marker.shape.setMap(null);
                }
                else {
                    if (zoom >= 3 && bounds.contains(marker.getPosition())) {
                        marker.shape.setMap(vm.map);
                    } else {
                        marker.shape.setMap(null);
                    }
                }
            });
        }

        function edit(marker) {
            $state.go(marker.geofence.isRadial ? 'geofence.radial' : 'geofence.polygon', { geofenceId: marker.geofence.id });
        }

        function getPolygonCenter(geofence) {
            var points = geofence.shapeText.replace('POLYGON ((','').replace('))','').split(', ');
            var bounds = new google.maps.LatLngBounds();
            var coord;
            _.forEach(points, function(point) {
                coord = point.trim().split(' ');
                bounds.extend(new google.maps.LatLng(Number(coord[1]), Number(coord[0])));
            });

            return bounds.getCenter();
        }

        function getPolygonCoordinates(geofence) {
            var coords = [];
            var coord;
            var points = geofence.shapeText.replace('POLYGON ((','').replace('))','').split(', ');
            _.forEach(points, function(point) {
                coord = point.trim().split(' ');
                coords.push(new google.maps.LatLng(Number(coord[1]), Number(coord[0])));
            });

            return coords;
        }

        function getRadiusInMeters(geofence) {
            switch (geofence.radiusUnitType) {
                case 'meters':
                    return geofence.radius;
                case 'kilometers':
                    return geofence.radius * 1000;
                case 'miles':
                    return geofence.radius * 1609.34;
                case 'feet':
                    return geofence.radius * 0.3048;
                default:
                    return 0;
            }
        }

        function handleIdle() {
            localStorageService.set('mapCenter', vm.map.getCenter());
            localStorageService.set('mapZoom', vm.map.getZoom());
            drawShapes();
        }

        function isMarkerVisible(marker) {
            return marker.getVisible();
        }

        function panToMarker(marker) {
            select(marker, true);

            var bounds;
            if (marker.geofence.isRadial) {
                bounds = marker.shape.getBounds();
            }
            else {
                bounds = new google.maps.LatLngBounds();
                var paths = marker.shape.getPaths();
                var path;
                for (var i = 0; i < paths.length; i++) {
                    path = marker.shape.getPaths().getAt(i);
                    for (var j = 0; j < path.length; j++ ) {
                        bounds.extend(path.getAt(j));
                    }
                }
            }

            vm.map.panTo(marker.getPosition());
            vm.map.fitBounds(bounds);
        }

        function select(marker, preserve) {
            preserve = preserve ? preserve : false;
            if (marker === vm.selected && !preserve) {
                unSelect(marker);
                return;
            }

            if (vm.selected) {
                unSelect(vm.selected);
            }
            vm.selected = marker;
            marker.setIcon(icons.selected);
            vm.selected.shape.setOptions(shapeStyles.selected);
        }

        function createPolygonMarker(geofence) {
            var marker = angular.extend(
                new google.maps.Marker({
                    id: geofence.geofenceId,
                    icon: icons.polygon,
                    position: getPolygonCenter(geofence),
                    map: vm.map
                }),
                {
                    geofence: {
                        id: geofence.geofenceId,
                        name: geofence.name,
                        address: geofence.address,
                        type: geofence.type,
                        comments: geofence.comments,
                        isRadial: false
                    },
                    shape: new google.maps.Polygon({
                        paths: getPolygonCoordinates(geofence),
                        strokeColor: shapeStyles.polygon.strokeColor,
                        strokeOpacity: shapeStyles.polygon.strokeOpacity,
                        strokeWeight: shapeStyles.polygon.strokeWeight,
                        fillColor: shapeStyles.polygon.fillColor,
                        fillOpacity: shapeStyles.polygon.fillOpacity
                    })
                }
            );
            addMarkerListeners(marker);
            return marker;
        }

        function createRadialMarker(geofence) {
            var marker = angular.extend(
                new google.maps.Marker({
                    id: geofence.geofenceId,
                    icon: icons.radial,
                    position: {
                        lat: geofence.latitudeCenter,
                        lng: geofence.longitudeCenter
                    },
                    map: vm.map
                }),
                {
                    geofence: {
                        id: geofence.geofenceId,
                        name: geofence.name,
                        address: geofence.address,
                        type: geofence.type,
                        comments: geofence.comments,
                        isRadial: true
                    },
                    shape: new google.maps.Circle({
                        center: {
                            lat: geofence.latitudeCenter,
                            lng: geofence.longitudeCenter
                        },
                        radius: getRadiusInMeters(geofence),
                        strokeColor: shapeStyles.radial.strokeColor,
                        strokeOpacity: shapeStyles.radial.strokeOpacity,
                        strokeWeight: shapeStyles.radial.strokeWeight,
                        fillColor: shapeStyles.radial.fillColor,
                        fillOpacity: shapeStyles.radial.fillOpacity
                    })
                }
            );
            addMarkerListeners(marker);
            return marker;
        }

        function refreshMarkers() {
            vm.visibleMarkerCount = 0;
            clearMarkers();

            _.forEach(vm.geofenceService.all, function(geofence) {
                var marker = geofence.type === 'radius' ? createRadialMarker(geofence) : createPolygonMarker(geofence);
                vm.markers.push(marker);
                vm.visibleMarkerCount = marker.getVisible() ? vm.visibleMarkerCount + 1 : vm.visibleMarkerCount;
            });
        }

        function clearMarkers() {
            _.forEach(vm.markers, function (marker) {
                marker.setMap(null);
                marker.shape.setMap(null);
            });
            vm.markers = [];
        }

        function setType(mapType) {
            vm.mapType = mapType;
            vm.map.setMapTypeId(mapType.type);
        }

        function setZoom(zoom) {
            google.maps.event.trigger(vm.map, 'resize');
            vm.map.panTo(zoom.center);
            vm.map.setZoom(zoom.zoomLevel);
        }

        function showMapData() {
            console.log('-----------------------------');
            console.log('SW= { lat: ' + vm.map.getBounds().getSouthWest().lat() + ', lng: ' + vm.map.getBounds().getSouthWest().lng() + '}');
            console.log('NE= { lat: ' + vm.map.getBounds().getNorthEast().lat() + ', lng: ' + vm.map.getBounds().getNorthEast().lng() + '}');
            console.log('CENTER= { lat: ' + vm.map.getCenter().lat() + ', lng: ' + vm.map.getCenter().lng() + '}');
            console.log('zoom=' + vm.map.getZoom());
            console.log('-----------------------------');
        }

        function unSelect() {
            if (vm.selected) {
                vm.selected.setIcon(vm.selected.geofence.isRadial ? icons.radial : icons.polygon);
                vm.selected.shape.setOptions(vm.selected.geofence.isRadial ? shapeStyles.radial : shapeStyles.polygon);
                vm.selected = null;
            }
        }
    }
})();