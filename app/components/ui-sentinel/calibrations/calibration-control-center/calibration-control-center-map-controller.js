(function() {
    'use strict';

    angular
        .module('ui-sentinel.calibrations.calibrationControlCenter')
        .controller('CalibrationControlCenterMapController', CalibrationControlCenterMapController);

    CalibrationControlCenterMapController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', '$filter', 'SentinelUiSession', 'localStorageService','CalibrationControlCenterReportsService','FeedbackService', 'MapsConstants','CalibrationControlCenterFilterService'];
    function CalibrationControlCenterMapController($rootScope, $scope, $state, $stateParams, $filter,SentinelUiSession, localStorageService, CalibrationControlCenterReportsService, FeedbackService, MapsConstants,CalibrationControlCenterFilterService) {
       
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
            mapShapeStyles: MapsConstants.shapes,
            reportMarkers: [],
            selectedReportMarker: null,
            feedback: FeedbackService,
            reportsService: CalibrationControlCenterReportsService,
            selectedIndex: null,
            nextAsset: null,
            previousAsset: null,
            filterService: CalibrationControlCenterFilterService,
            selected:null,
            showMap:true,
            showTable:false,
            actions: {
                reload: reload,
                selectReport:selectReport,
                closeAssetDetails: closeAssetDetails,
                navToMap: navToMap,
                navToReports: navToReports
            }
        };
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'calibrations.controlcenter') {
                    $state.go('calibrations.controlcenter');
                }
                vm.reportsService.clear();
            });

            vm.reportsService.init();

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
                    selectReport(report);
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

        function selectReport(report){

            if (vm.selectedReportMarker) {
                vm.selectedReportMarker.setMap(null);
                vm.selectedReportMarker = null;
                vm.selectedIndex = null;
            }

            if (!report) {
                return;
            }

            var index = _.findIndex(vm.reportsService.reports, function(l) {
                return l.sentinelId === report.sentinelId;
            });

            console.log("index",index);

            vm.selectedIndex = index;
            vm.nextAsset = index === 0 ? null : findNextVisible(index);
            vm.previousAsset = index === vm.reportsService.reports.length - 1 ? null : findPrevVisible(index);
            vm.reportsService.selected = report;

            if (report.latitude || report.longitude) {
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

        function onFilterChange() {
            _.forEach(vm.reportMarkers, function(marker) {
                marker.setVisible(vm.filterService.filter(marker.report));
            });

            if (vm.selectedReportMarker && !vm.filterService.filter(vm.selectedReportMarker.report)) {
                selectReport(null);
            }
        }


        function closeAssetDetails(){
            vm.selected = null;
            if (vm.selectedReportMarker) {
                vm.selectedReportMarker.setMap(null);
                vm.selectedReportMarker = null;
            }
            reload();
        }

        

        function initMap() {

        	vm.map = new google.maps.Map(document.getElementById("controlCenterMap"), {
                zoom: vm.mapZooms.geofenceDefault.zoomLevel,
                center: vm.mapZooms.geofenceDefault.center,
                mapTypeId: vm.mapType.type,
                minZoom: 2,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.TERRAIN]
                }
            });
            vm.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('legendTool'));
            vm.map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('centerTrackingZoomLabel'));
            vm.map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('locationTrackingZoom'));        
              vm.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('mapPropTool'));
            onWindowResize();

            google.maps.event.addDomListener(window, 'resize', onWindowResize);
        }

        function onWindowResize() {
            if ($state.current.name !== 'calibrations.controlcenter') {
                return;
            }
            
            var center = vm.map.getCenter();

            var newHeight = window.innerHeight * 0.60;
            var mapDiv = document.getElementById("controlCenterMap");
            mapDiv.style.height = Math.round(newHeight) + 'px';

            //var mapItemListDiv = document.getElementById('map-items-list');
            //mapItemListDiv.style.height = (Math.round(newHeight) + 172) + 'px';

            google.maps.event.trigger(vm.map, 'resize');
            vm.map.setCenter(center);
        }


        function onReportsChange(reports) {
            clearAssetMarker();

            var bounds = new google.maps.LatLngBounds();

            _.forEach(reports, function(report) {
                if (report.latitude !== null && report.longitude !== null) {
                    var strLocationMethod = $filter('locationMethod')(report.locationMethod, report.latitude, report.longitude);
                    var zIndexName = report.severity.toLowerCase() + '-' + strLocationMethod.toLowerCase();
                    var marker = angular.extend(
                        new google.maps.Marker({
                            id: report.guid,
                            icon: MapsConstants.icons.deviceReports.normal.default,
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

            
            if (reports.length == 1) {
                // set center of map
                vm.map.setCenter(bounds.getCenter());
                vm.map.setZoom(16);
            } else if (reports.length > 1) {
                // fit to bounds
                vm.map.fitBounds(bounds);
            }
            
            
        }

        function addReportMarkerListeners(marker) {
            google.maps.event.addListener(marker, 'click', function() {
                onReportMarkerClick(marker);
                $scope.$apply();
            });
        }

        function onReportMarkerClick(marker) {
            vm.reportsService.selected = vm.reportsService.selected === marker.report ? null : marker.report;
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

        function clearAssetMarker() {
            if (vm.reportMarkers.length>0) {
            	_.forEach(vm.reportMarkers,function(m){
                    console.log("m",m);
            		m.setMap(null);
                	m = null;
            	});
                vm.reportMarkers = [];
            }
        }


        function reload(){
        	clearAssetMarker();
            vm.reportsService.init();
        }
         function navToMap(){
            vm.showMap=true;
            vm.showTable=false;
        }

        function navToReports(){
            vm.showMap=false;
            vm.showTable=true;
        }
        
       

        
    }
})();
