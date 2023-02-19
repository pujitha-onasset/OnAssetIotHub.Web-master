(function () {
    'use strict';

    angular
        .module('tracking.ui.shipment.map')
        .controller('ShipmentMapController', ShipmentMapController);


    ShipmentMapController.$inject = ['$scope', '$state', '$stateParams', 'localStorageService', 'ShipmentService', 'ShipmentReportsService', 'ShipmentReportsFilterService', 'CommonMapService', 'TrackingFeedbackService'];
    function ShipmentMapController($scope, $state, $stateParams, localStorageService, ShipmentService, ShipmentReportsService, ShipmentReportsFilterService, CommonMapService, TrackingFeedbackService) {
        var MAP_DIV = 'shipmentMap';

        var markerZIndices = {
            'stop': 9,
            'ok-network': 10,
            'ok-gps': 11,
            'info-network': 12,
            'info-gps': 13,
            'warning-network': 14,
            'warning-gps-network': 15,
            'selected': 20
        };

        var vm = {
            shipment: null,
            shipmentId: null,
            map: null,
            mapType: CommonMapService.getMapTypes().hybrid,
            mapTypes: CommonMapService.getMapTypes(),
            mapZooms: CommonMapService.getMapZooms(),
            filterService: ShipmentReportsFilterService,
            shipmentService: ShipmentService,
            reportsService: ShipmentReportsService,
            feedback: TrackingFeedbackService,
            zoomLimit: 10,
            zoomLevel: null,
            center: null,
            reportMarkers: [],
            polyline: null,
            polylineBg: null,
            selectedReportMarker: null,
            selectedIndex: null,
            nextReport: null,
            previousReport: null,
            onReportsChange: onReportsChange,
            onSelectedReportChange: onSelectedReportChange,
            onFilterChange: onFilterChange,
            actions: {
                map: {
                    panToReports: panToReports
                },
                reportMarker: {
                    panTo: panToReportMarker,
                    centerOnTimeline: centerOnTimeline
                },
                selectReport: selectReport,
                closeReportDetails: closeReportDetails
            }
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////


        function activate() {
            // if (vm.shipmentId !== vm.reportsService.shipmentId) {
            //     vm.reportsService.init(vm.shipmentId);
            // }

            initMap();

            $scope.$watchCollection(
                function() {
                    return vm.reportsService.reports;
                },
                function (reports) {
                    if ($state.current.name !== 'shipment.map') {
                        return;
                    }
                    onReportsChange(reports);
                }
            );
            $scope.$watch(
                function() {
                    return vm.shipmentService.shipment;
                },
                function (shipment) {
                    if ($state.current.name !== 'shipment.map') {
                        return;
                    }

                    onShipmentChange(shipment);
                }
            );
            $scope.$watch(
                function() {
                    return vm.reportsService.selected;
                },
                function (report) {
                    if ($state.current.name !== 'shipment.map') {
                        return;
                    }

                    onSelectedReportChange(report);
                }, true
            );
            $scope.$watch(
                function() {
                    return vm.filterService;
                },
                function () {
                    if ($state.current.name !== 'shipment.map') {
                        return;
                    }

                    onFilterChange();
                }, true
            );

            vm.shipmentId = $stateParams.shipmentId ? $stateParams.shipmentId : localStorageService.get('shipment.map.shipmentId');
            if (!vm.shipmentId) {
                $state.go('home');
                return;
            }
            localStorageService.set('shipment.map.shipmentId', vm.shipmentId);
            if (!vm.shipmentService.shipment || vm.shipmentService.shipment.shipmentInfo.shipmentId !== vm.shipmentId) {
                vm.shipmentService.loadShipment(vm.shipmentId);
            }
        }

        function addReportMarkerListeners(marker) {
            google.maps.event.addListener(marker, 'click', function() {
                onReportMarkerClick(marker);
                $scope.$apply();
            });
        }

        function centerOnTimeline() {
            if (vm.reportsService.selected) {
                vm.reportsService.selected.centerOnTimeline();
            }
            $('#btn-details-center-timeline').blur();
        }

        function clearMarkers() {
            _.forEach(vm.reportMarkers, function(marker) {
                marker.setMap(null);
            });
            vm.reportMarkers = [];
        }

        function clearPolyline() {
            if (vm.polyline) {
                vm.polyline.setMap(null);
                vm.polyline = null;
                vm.polylineBg.setMap(null);
                vm.polylineBg = null;
            }
        }

        function closeReportDetails() {
            vm.reportsService.selected = null;
        }

        function findNextVisible(selectedIndex) {
            for(var i = selectedIndex - 1; i >= 0; i--) {
                if (vm.filterService.filter(vm.reportsService.reports[i])) {
                    return vm.reportsService.reports[i];
                }
            }
            return null;
        }

        function findPrevVisible(selectedIndex) {
            for(var i = selectedIndex + 1; i <= vm.reportsService.reports.length - 1; i++) {
                if (vm.filterService.filter(vm.reportsService.reports[i])) {
                    return vm.reportsService.reports[i];
                }
            }
            return null;
        }

        function handleIdle() {
            vm.center = {
                lat: Math.round(vm.map.getCenter().lat() * 1000000) / 1000000,
                lng: Math.round(vm.map.getCenter().lng() * 1000000) / 1000000
            };
            vm.zoomLevel = vm.map.getZoom();
            $scope.$apply();
        }

        function initMap() {
            vm.map = new google.maps.Map(document.getElementById(MAP_DIV), {
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
        }

        function onFilterChange() {
            _.forEach(vm.reportMarkers, function(marker) {
                marker.setVisible(vm.filterService.filter(marker.report));
            });

            if (vm.selectedReportMarker && !vm.filterService.filter(vm.selectedReportMarker.report)) {
                selectReport(null);
            }
        }

        function onMapClick() {
            if (vm.reportsService.selected) {
                vm.reportsService.selected = null;
                $scope.$apply();
            }
        }

        function onReportMarkerClick(marker) {
            if (vm.selectedStopMarker) {
                vm.selectedStopMarker.setMap(null);
                vm.selectedStopMarker = null;
            }
            vm.reportsService.selected = vm.reportsService.selected === marker.report ? null : marker.report;
        }

        function onReportsChange(reports) {
            clearMarkers();
            clearPolyline();
             var bounds = new google.maps.LatLngBounds();
            _.forEach(reports, function(report) {
                if (report.latitude !== null && report.longitude !== null) {
                    var zIndexName = 'ok-' + (!report.locationMethod ? 'none' : (report.locationMethod.toLowerCase() === 'anchor' ? 'anchor' :report.locationMethod.toLowerCase() === 'gps' ? 'gps' : 'network'));
                    var iconOptions = {
                        url: '../img/' + zIndexName + '.png',
                        anchor: {x: 11, y: 11},
                        scaledSize: { height: 24, width: 24}
                    };
                    var marker = angular.extend(
                        new google.maps.Marker({
                            id: report.reportGuid,
                            icon: iconOptions,
                            zIndex: markerZIndices[zIndexName],
                            position: {
                                lat: report.latitude,
                                lng: report.longitude
                            },
                            map: vm.map,
                            visible: vm.filterService.filter(report)
                        }),
                        {
                            report: report
                        }
                    );
                    setReportMarkerIcon(marker);
                    addReportMarkerListeners(marker);
                    vm.reportMarkers.push(marker);

                    if (report.latitude !== 0 || report.longitude !== 0) {
                        var latlng = new google.maps.LatLng(report.latitude, report.longitude);
                        bounds.extend(latlng);
                    }
                }
            });
            if (reports.length == 1 && vm.reportMarkers.length>0 ) {
                // set center of map
                vm.map.setCenter(bounds.getCenter());
                vm.map.setZoom(16);
            } else if (reports.length > 1 && vm.reportMarkers.length>0 ) {
                // fit to bounds
                vm.map.fitBounds(bounds);
            } else {
                vm.map.setZoom(0);
            }

            var polylineCoordinates = [];
            _.forEach(vm.reportMarkers, function(marker) {
                polylineCoordinates.push(marker.getPosition());
            });
            vm.polyline = new google.maps.Polyline({
                clickable: false,
                path: polylineCoordinates,
                geodesic: false,
                strokeColor: '#00ffc8',
                strokeOpacity: 0.8,
                strokeWeight: 3,
                zIndex: 2,
                map: vm.map
            });
            vm.polylineBg = new google.maps.Polyline({
                clickable: false,
                path: polylineCoordinates,
                geodesic: false,
                strokeColor: '#000000',
                strokeOpacity: 0.6,
                strokeWeight: 5,
                zIndex: 1,
                map: vm.map
            });
        }

        function onSelectedReportChange(report) {
            if (vm.selectedReportMarker) {
                vm.selectedReportMarker.setMap(null);
                vm.selectedReportMarker = null;
                vm.selectedIndex = null;
            }

            if (!report) {
                return;
            }

            var index = _.findIndex(vm.reportsService.reports, function(r) {
                return r.reportGuid === report.reportGuid;
            });

            vm.selectedIndex = index;
            vm.nextReport = index === 0 ? null : findNextVisible(index);
            vm.previousReport = index === vm.reportsService.reports.length - 1 ? null : findPrevVisible(index);

            if (!report.latitude || !report.longitude) {
                return;
            }

            var iconName = '../img/ok-' + (!report.locationMethod ? 'none' : (report.locationMethod.toLowerCase() === 'anchor' ? 'anchor' :report.locationMethod.toLowerCase() === 'anchor' ? 'anchor' :report.locationMethod.toLowerCase() === 'gps' ? 'gps' : 'network')) + '-selected.png';
            vm.selectedReportMarker = new google.maps.Marker({
                id: 'selected',
                icon: {
                    url: iconName,
                    anchor: {x: 11, y: 11},
                    scaledSize: { height: 24, width: 24}
                },
                zIndex: markerZIndices.selected,
                position: {
                    lat: report.latitude,
                    lng: report.longitude
                },
                map: vm.map
            });
            addReportMarkerListeners(vm.selectedReportMarker);
            vm.selectedReportMarker.report = report;
        }

        function onShipmentChange(shipment) {
            vm.shipment = shipment;
            if (!vm.shipment) {
                vm.shipmentId = null;
                vm.reportsService.clear();
                return;
            }
            vm.reportsService.init(vm.shipment.shipmentInfo.shipmentId);
        }

        function onWindowResize() {
            if ($state.current.name !== 'shipment.map') {
                return;
            }

            var center = vm.map.getCenter();

            var newHeight = window.innerHeight * 0.60;
            var mapDiv = document.getElementById(MAP_DIV);
            mapDiv.style.height = Math.round(newHeight) + 'px';

            var mapItemListDiv = document.getElementById('map-items-list');
            mapItemListDiv.style.height = (Math.round(newHeight) + 172) + 'px';

            google.maps.event.trigger(vm.map, 'resize');
            vm.map.setCenter(center);
        }

        function panToReportMarker(marker) {
            vm.map.panTo(marker.getPosition());
            vm.map.setZoom(11);
            $('#btn-details-center-map').blur();
        }

        function panToReports() {
            var latLngBounds = new google.maps.LatLngBounds();
            _.forEach(vm.reportMarkers, function (marker) {
                latLngBounds.extend(marker.getPosition());
            });
            vm.map.fitBounds(latLngBounds);
        }

        function selectReport(report) {
            vm.reportsService.selected = vm.reportsService.selected === report ? null : report;
            $('#btn-details-select-prev').blur();
            $('#btn-details-select-next').blur();
        }

        function setReportMarkerIcon(marker) {
            if (!marker || !marker.report) {
                return;
            }

            var iconName = '../img/ok-' + (!marker.report.locationMethod ? 'none' : (marker.report.locationMethod.toLowerCase() === 'anchor' ? 'anchor' :marker.report.locationMethod.toLowerCase() === 'anchor' ? 'anchor' : marker.report.locationMethod.toLowerCase() === 'gps' ? 'gps' : 'network')) + '.png';
            var iconOptions = {
                url: iconName,
                anchor: {x: 11, y: 11},
                scaledSize: { height: 24, width: 24}
            };
            marker.setIcon(iconOptions);
        }


    }
})();