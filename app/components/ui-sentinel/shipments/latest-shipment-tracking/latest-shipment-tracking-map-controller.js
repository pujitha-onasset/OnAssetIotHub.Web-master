(function () {
    'use strict';

    angular
        .module('ui-sentinel.shipments.latestShipmentTracking')
        .controller('LatestShipmentsTrackingMapController', LatestShipmentsTrackingMapController);


    LatestShipmentsTrackingMapController.$inject = ['$rootScope', '$scope', '$state', '$filter', 'localStorageService', 'LatestShipmentTrackingReportsService', 'LatestShipmentTrackingFilterService', 'MapsConstants', 'UomSecondsConverter'];
    function LatestShipmentsTrackingMapController($rootScope, $scope, $state, $filter, localStorageService, LatestShipmentTrackingReportsService, LatestShipmentTrackingFilterService, MapsConstants, UomSecondsConverter) {
        var googleMapDivId = 'latestShipmentTrackingMap';

        var markerZIndices = {
            'ok-network': 10,
            'ok-gps': 11,
            'info-network': 12,
            'info-gps': 13,
            'warning-network': 14,
            'warning-gps': 15,
            'selected': 16
        };

        var vm = {
            map: null,
            mapType: MapsConstants.mapTypes.hybrid,
            mapTypes: MapsConstants.mapTypes,
            mapZooms: MapsConstants.zooms,
            filterService: LatestShipmentTrackingFilterService,
            reportsService: LatestShipmentTrackingReportsService,
            secondsService: UomSecondsConverter,
            zoomLimit: 10,
            zoomLevel: null,
            center: null,
            reportMarkers: [],
            selectedReportMarker: null,
            selectedIndex: null,
            hover: null,
            nextReport: null,
            previousReport: null,
            onReportsChange: onReportsChange,
            onSelectedReportChange: onSelectedReportChange,
            onFilterChange: onFilterChange,
            actions: {
                map: {
                    setZoom: setZoom,
                    setType: setType
                },
                reportMarker: {
                    panTo: panToReportMarker,
                    centerOnTimeline: centerOnTimeline
                },
                selectReport: selectReport,
                closeReportDetails: closeReportDetails,
                goToShipmentMap: goToShipmentMap,
                goToShipmentAdmin: goToShipmentAdmin,
                goToShipmentReports: goToShipmentReports,
                gotoSightingsForReport: gotoSightingsForReport,
            }
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////


        function activate() {
            vm.reportsService.restartCache();
            vm.reportsService.load(vm.reportsService.fromDate, vm.reportsService.toDate);

            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'shipments.map') {
                    vm.reportsService.load(vm.reportsService.fromDate, vm.reportsService.toDate);
                }
            });

            initMap();

            $scope.$watchCollection(
                function() {
                    return vm.reportsService.reports;
                },
                function (reports) {
                    onReportsChange(reports);
                }
            );
            $scope.$watch(
                function() {
                    return vm.reportsService.selected;
                },
                function (report) {
                    onSelectedReportChange(report);
                }, true
            );
            $scope.$watch(
                function() {
                    return vm.filterService;
                },
                function () {
                    onFilterChange();
                }, true
            );
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

        function closeReportDetails() {
            vm.reportsService.selected = null;
        }

        function goToShipmentMap() {
            if (vm.reportsService.selected) {
                $state.go('shipment.map',{ shipmentId: vm.reportsService.selected.shipment.shipmentId, referrer: 'shipments.map' });
            }
        }

        function goToShipmentReports() {
            if (vm.reportsService.selected) {
                $state.go('shipment.reports',{ shipmentId: vm.reportsService.selected.shipment.shipmentId, referrer: 'shipments.map'  });
            }
        }

        function gotoSightingsForReport() {
            if (vm.reportsService.selected) {
                $state.go('sightings.for-report', { reportId: vm.reportsService.selected.reportGuid });
            }
        }

        function goToShipmentAdmin() {
            if (vm.reportsService.selected) {
                $state.go('shipment.admin',{ shipmentId: vm.reportsService.selected.shipment.shipmentId, referrer: 'shipments.map' });
            }
        }

        function handleIdle() {
            vm.center = {
                lat: Math.round(vm.map.getCenter().lat() * 1000000) / 1000000,
                lng: Math.round(vm.map.getCenter().lng() * 1000000) / 1000000
            };
            vm.zoomLevel = vm.map.getZoom();

            localStorageService.set('mapCenter', vm.center);
            localStorageService.set('mapZoom', vm.zoomLevel);
            $scope.$apply();
        }

        function initMap() {
            var mapCenter = localStorageService.get('mapCenter');
            var mapCenterLat = localStorageService.get('mapCenterLat');
            var mapCenterLng = localStorageService.get('mapCenterLng');
            var mapZoom = localStorageService.get('mapZoom');

            vm.map = new google.maps.Map(document.getElementById(googleMapDivId), {
                zoom: mapZoom || MapsConstants.zooms.world.zoomLevel,
                minZoom: 2,
                center: mapCenter || MapsConstants.zooms.world.center,
                gestureHandling: 'greedy',
                mapTypeId: vm.mapType.type,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.TERRAIN]
                }
            });

            vm.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('legendTool'));
            vm.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('mapPropTool'));
            onWindowResize();

            google.maps.event.addListener(vm.map, 'idle', handleIdle);
            google.maps.event.addListener(vm.map, 'click', onMapClick);
            google.maps.event.addDomListener(window, 'resize', onWindowResize);
        }

        function onFilterChange() {
            _.forEach(vm.reportMarkers, function(marker) {
                marker.setVisible(vm.filterService.reports.filter(marker.report));
            });

            if (vm.selectedReportMarker && !vm.filterService.reports.filter(vm.selectedReportMarker.report)) {
                selectReport(null);
            }
        }

        function onReportMarkerClick(marker) {
            vm.reportsService.selected = vm.reportsService.selected === marker.report ? null : marker.report;
        }

        function onReportsChange(reports) {
            clearMarkers();

            var bounds = new google.maps.LatLngBounds();

            _.forEach(reports, function(report) {
                if (report.latitude !== null && report.longitude !== null) {
                    var strLocationMethod = $filter('locationMethod')(report.locationMethod, report.latitude, report.longitude);
                    var zIndexName = report.severity.toLowerCase() + '-' + strLocationMethod.toLowerCase();

                    var marker = angular.extend(
                        new google.maps.Marker({
                            id: report.shipment.shipmentId,
                            icon: MapsConstants.icons.deviceReports.normal.default,
                            zIndex: markerZIndices[zIndexName],
                            position: {
                                lat: report.latitude,
                                lng: report.longitude
                            },
                            map: vm.map,
                            visible: vm.filterService.reports.filter(report)
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

            if (reports.length == 1 && vm.reportMarkers.length>0) {
                // set center of map
                vm.map.setCenter(bounds.getCenter());
                vm.map.setZoom(16);
            } else if (reports.length > 1 && vm.reportMarkers.length>0) {
                // fit to bounds
                vm.map.fitBounds(bounds);
            } else {
                vm.map.setZoom(0);
            }
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
                return r.shipment.shipmentId === report.shipment.shipmentId;
            });

            vm.selectedIndex = index;
            vm.nextReport = index === 0 ? null : findNextVisible(index);
            vm.previousReport = index === vm.reportsService.reports.length - 1 ? null : findPrevVisible(index);

            if (!report.latitude || !report.longitude) {
                return;
            }

            var strLocationMethod = $filter('locationMethod')(report.locationMethod, report.latitude, report.longitude);
            var iconName = '../img/' + report.severity + '-' + strLocationMethod.toLowerCase() + '-selected.png';

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

        function findNextVisible(selectedIndex) {
            for(var i = selectedIndex - 1; i >= 0; i--) {
                if (vm.filterService.reports.filter(vm.reportsService.reports[i])) {
                    return vm.reportsService.reports[i];
                }
            }
            return null;
        }

        function findPrevVisible(selectedIndex) {
            for(var i = selectedIndex + 1; i <= vm.reportsService.reports.length - 1; i++) {
                if (vm.filterService.reports.filter(vm.reportsService.reports[i])) {
                    return vm.reportsService.reports[i];
                }
            }
            return null;
        }

        function onMapClick() {
            if (vm.reportsService.selected) {
                vm.reportsService.selected = null;
                $scope.$apply();
            }
        }

        function onWindowResize() {
            if ($state.current.name !== 'shipments.map') {
                return;
            }

            var center = vm.map.getCenter();

            var newHeight = window.innerHeight * 0.60;
            var mapDiv = document.getElementById(googleMapDivId);
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

        function setReportMarkerIcon(marker) {
            if (!marker || !marker.report) {
                return;
            }

            var strLocationMethod = $filter('locationMethod')(marker.report.locationMethod, marker.report.latitude, marker.report.longitude);
            var iconName = '../img/' + marker.report.severity + '-' + strLocationMethod.toLowerCase() + '.png';

            var iconOptions = {
                url: iconName,
                anchor: {x: 11, y: 11},
                scaledSize: { height: 24, width: 24}
            };
            marker.setIcon(iconOptions);
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

        function selectReport(report) {
            vm.reportsService.selected = vm.reportsService.selected === report ? null : report;
            $('#btn-details-select-prev').blur();
            $('#btn-details-select-next').blur();
        }
    }
})();