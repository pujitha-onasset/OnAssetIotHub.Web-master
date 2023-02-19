(function () {
    'use strict';

    angular
        .module('tracking.ui.shipments.map')
        .controller('ShipmentsMapController', ShipmentsMapController);


    ShipmentsMapController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'localStorageService', 'ShipmentsService', 'ShipmentsFilterService', 'CommonMapService'];
    function ShipmentsMapController($rootScope, $scope, $state, $stateParams, localStorageService, ShipmentsService, ShipmentsFilterService, CommonMapService) {

        var markerZIndices = {
            'ok-network': 10,
            'ok-gps': 11,
            'ok-anchor': 12,
            'info-network': 13,
            'info-gps': 14,
            'info-anchor': 15,
            'warning-network': 16,
            'warning-gps': 17,
            'warning-anchor': 18,
            'selected': 19
        };

        var vm = {
            map: null,
            shipmentsService: ShipmentsService,
            filterService: ShipmentsFilterService,
            mapType: CommonMapService.getMapTypes().hybrid,
            mapTypes: CommonMapService.getMapTypes(),
            mapZooms: CommonMapService.getMapZooms(),
            zoomLimit: 10,
            center: null,
            zoomLevel: null,
            shipmentMarkers: [],
            selectedMarker: null,
            actions: {
                map: {
                    setZoom: setZoom,
                    setType: setType,
                    panToReports: panToReports
                },
                selectedMarker: {
                    panTo: panToMarker,
                    centerOnTimeline: centerOnTimeline
                },
                selectShipment: selectShipment,
                closeSelectedPanel: closeSelectedPanel,
                goToShipmentMap: goToShipmentMap,
                goToShipmentReports: goToShipmentReports
            },
            getMapZoom: getMapZoom,
            getMapCenter: getMapCenter
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////


        function activate() {
            vm.shipmentsService.clear();
            var shipmentIds = $stateParams.shipmentIds ? $stateParams.shipmentIds : localStorageService.get('shipments.map.shipmentIds');
            if (!shipmentIds) {
              $state.go('home');
            }

            localStorageService.set('shipments.map.shipmentIds', shipmentIds);

            vm.map = new google.maps.Map(document.getElementById('shipmentsMap'), {
                zoom: vm.mapZooms.world.zoomLevel,
                minZoom: 2,
                center: vm.mapZooms.world.center,
                mapTypeId: vm.mapType.type,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.TERRAIN]
                }
            });

            vm.map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('reportsZoom'));
            vm.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('legendTool'));
            vm.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('mapPropTool'));
            onWindowResize();

            google.maps.event.addListener(vm.map, 'idle', handleIdle);
            google.maps.event.addListener(vm.map, 'click', onMapClick);
            google.maps.event.addDomListener(window, 'resize', onWindowResize);

            $scope.$watchCollection(
                function() {
                    return vm.shipmentsService.shipments;
                },
                function (shipments) {
                    onShipmentsChange(shipments);
                }
            );
            $scope.$watch(
                function() {
                    return vm.shipmentsService.selected;
                },
                function (shipment) {
                    onSelectedChange(shipment);
                }, true
            );

            _.forEach(shipmentIds, function (shipmentId) {
                vm.shipmentsService.loadShipment(shipmentId);
            });
        }

        function addMarkerListeners(marker) {
            google.maps.event.addListener(marker, 'click', function() {
                onMarkerClick(marker);
                $scope.$apply();
            });
        }

        function centerOnTimeline() {
            if (vm.shipmentsService.selected) {
                vm.shipmentsService.selected.centerOnTimeline();
            }
            $('#btn-details-center-timeline').blur();
        }

        function clearMarkers() {
            _.forEach(vm.shipmentMarkers, function(marker) {
                marker.setMap(null);
            });
            vm.shipmentMarkers = [];
        }

        function closeSelectedPanel() {
            vm.shipmentsService.selected = null;
        }

        function getMapZoom() {
            return vm.map.getZoom();
        }

        function getMapCenter() {
            var center = vm.map.getCenter();
            var lat = Math.round(center.lat() * 1000000) / 1000000;
            var lng = Math.round(center.lng() * 1000000) / 1000000;
            return { lat: lat, lng: lng};
        }

        function goToShipmentMap() {
            if (vm.shipmentsService.selected) {
                $state.go('shipment.map',{
                    shipmentId: vm.shipmentsService.selected.shipmentInfo.shipmentId,
                    shipment: vm.shipmentsService.selected,
                    referrer: 'shipments.map' });
            }
        }

        function goToShipmentReports() {
            if (vm.shipmentsService.selected) {
                $state.go('shipment.reports',{
                    shipmentId: vm.shipmentsService.selected.shipmentId,
                    shipment: vm.shipmentsService.selected,
                    referrer: 'shipments.map'  });
            }
        }

        function handleIdle() {
            vm.center = {
                lat: Math.round(vm.map.getCenter().lat() * 1000000) / 1000000,
                lng: Math.round(vm.map.getCenter().lng() * 1000000) / 1000000
            };
            vm.zoomLevel = vm.map.getZoom();
            $scope.$apply();
        }

        function onFilterChange() {
            _.forEach(vm.shipmentMarkers, function(marker) {
                marker.setVisible(vm.filterService.shipments.filter(marker.shipment));
            });

            if (vm.selectedReportMarker && !vm.filterService.shipments.filter(vm.selectedMarker.shipment)) {
                selectShipment(null);
            }
        }

        function onMarkerClick(marker) {
            vm.shipmentsService.selected = vm.shipmentsService.selected === marker.shipment ? null : marker.shipment;
        }

        function onShipmentsChange(shipments) {
            clearMarkers();
            var bounds = new google.maps.LatLngBounds();
            _.forEach(shipments, function(shipment) {
                if (shipment.latestReport && shipment.latestReport.latitude !== null && shipment.latestReport.longitude !== null) {
                    var zIndexName = 'ok-' + (!shipment.latestReport.locationMethod ? 'none' : (shipment.latestReport.locationMethod.toLowerCase() === 'anchor' ? 'anchor' :shipment.latestReport.locationMethod.toLowerCase() === 'gps' ? 'gps' : 'network'));
                    var iconOptions = {
                        url: '../img/' + zIndexName + '.png',
                        anchor: {x: 11, y: 11},
                        scaledSize: { height: 24, width: 24}
                    };

                    var marker = angular.extend(
                        new google.maps.Marker({
                            id: shipment.shipmentId,
                            icon: iconOptions,
                            zIndex: markerZIndices[zIndexName],
                            position: {
                                lat: shipment.latestReport.latitude,
                                lng: shipment.latestReport.longitude
                            },
                            map: vm.map
                            //visible: vm.filterService.shipments.filter(shipment)
                        }),
                        {
                            shipment: shipment
                        }
                    );
                    addMarkerListeners(marker);
                    vm.shipmentMarkers.push(marker);
                    if (shipment.latitude !== 0 || shipment.longitude !== 0) {
                        var latlng = new google.maps.LatLng(shipment.latestReport.latitude, shipment.latestReport.longitude);
                        bounds.extend(latlng);
                    }
                }
            });

            if (shipments.length == 1 && vm.shipmentMarkers.length>0) {
                // set center of map
                vm.map.setCenter(bounds.getCenter());
                vm.map.setZoom(16);
            } else if (shipments.length > 1 && vm.shipmentMarkers.length>0) {
                // fit to bounds
                vm.map.fitBounds(bounds);
            } else {
                vm.map.setZoom(0);
            }
        }

        function onSelectedChange(shipment) {
            if (vm.selectedMarker) {
                vm.selectedMarker.setMap(null);
                vm.selectedMarker = null;
                vm.selectedIndex = null;
            }

            if (!shipment) {
                return;
            }

            if (!shipment.latestReport || !shipment.latestReport.latitude || !shipment.latestReport.longitude) {
                return;
            }

            var iconName = '../img/ok-' + (!shipment.latestReport.locationMethod ? 'none' : (shipment.latestReport.locationMethod.toLowerCase() === 'anchor' ? 'anchor' :shipment.latestReport.locationMethod.toLowerCase() === 'gps' ? 'gps' : 'network')) + '-selected.png';
            vm.selectedMarker = new google.maps.Marker({
                id: 'selected',
                icon: {
                    url: iconName,
                    anchor: {x: 11, y: 11},
                    scaledSize: { height: 24, width: 24}
                },
                zIndex: markerZIndices.selected,
                position: {
                    lat: shipment.latestReport.latitude,
                    lng: shipment.latestReport.longitude
                },
                map: vm.map
            });
            addMarkerListeners(vm.selectedMarker);
            vm.selectedMarker.shipment = shipment;
        }

        function onMapClick() {
            if (vm.shipmentsService.selected) {
                vm.shipmentsService.selected = null;
                $scope.$apply();
            }
        }

        function onWindowResize() {
            if ($state.current.name !== 'shipments.map') {
                return;
            }

            var newHeight = window.innerHeight * 0.60;
            var mapDiv = document.getElementById('shipmentsMap');
            mapDiv.style.height = Math.round(newHeight) + 'px';

            var mapItemListDiv = document.getElementById('map-items-list');
            mapItemListDiv.style.height = (Math.round(newHeight) + 172) + 'px';

            if (vm.map) {
                var center = vm.map.getCenter();
                google.maps.event.trigger(vm.map, 'resize');
                vm.map.setCenter(center);
            }
        }

        function panToMarker(marker) {
            vm.map.setCenter(marker.getPosition());
            $('#btn-details-center-map').blur();
        }

        function panToReports() {
            var latLngBounds = new google.maps.LatLngBounds();
            _.forEach(vm.shipmentMarkers, function (marker) {
                latLngBounds.extend(marker.getPosition());
            });
            vm.map.fitBounds(latLngBounds);
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

        function selectShipment(shipment) {
            vm.shipmentsService.selected = vm.shipmentsService.selected === shipment ? null : shipment;
            $('#btn-details-select-prev').blur();
            $('#btn-details-select-next').blur();
        }
    }
})();