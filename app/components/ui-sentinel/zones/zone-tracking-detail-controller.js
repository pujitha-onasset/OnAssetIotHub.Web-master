(function() {
    'use strict';

    angular
        .module('ui-sentinel.zones')
        .controller('ZoneTrackingDetailController', ZoneTrackingDetailController);

    ZoneTrackingDetailController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'SentinelUiSession', 'localStorageService', 'ZoneService','FeedbackService', 'MapsConstants'];
    function ZoneTrackingDetailController($rootScope, $scope, $state, $stateParams, SentinelUiSession, localStorageService, ZoneService, FeedbackService, MapsConstants) {
       
        var vm = {
            map: null,
            mapType: MapsConstants.mapTypes.hybrid,
            mapTypes: MapsConstants.mapTypes,
            mapZooms: MapsConstants.zooms,
            mapShapeStyles: MapsConstants.shapes,
            zones: [],
            zoneMarkers: [],
            feedback: FeedbackService,
            filter: {
            	searchText: null,
            	filter: filter
            },
            actions: {
                gotoAddAsset: gotoAddAsset,
                gotoAsset: gotoAsset,
                load: load,
                reload: reload
            }
        };
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
            
            load();
        }

        function gotoAddAsset(){
        	$state.go('asset.new');
        }

        function gotoAsset(asset){

        }

        function filter(asset) {
            var isTextMatch = true;
            if (vm.filter.searchText) {
                isTextMatch = (
                    asset.assetName.toLowerCase().indexOf(vm.filter.searchText.toLowerCase()) > -1 ||
                    asset.deviceId.toLowerCase().indexOf(vm.filter.searchText.toLowerCase()) > -1 ||
                    asset.deviceType.toLowerCase().indexOf(vm.filter.searchText.toLowerCase()) > -1 ||
                    (asset.assetNotes !== null && asset.assetNotes.toLowerCase().indexOf(vm.filter.searchText.toLowerCase()) > -1)
                );
            }

            return isTextMatch;
        }

        function initMap(zone) {

        	 vm.map = new google.maps.Map(document.getElementById("assetMap"), {
                zoom: vm.mapZooms.geofenceDefault.zoomLevel,
                center: vm.mapZooms.geofenceDefault.center,
                mapTypeId: vm.mapType.type,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.TERRAIN]
                }
            });

            vm.map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('centerTrackingZoomLabel'));
            vm.map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('locationTrackingZoom'));

            panToReports(zone);
            panToAsset(zone);
        }

        function panToAsset(zone) {
            if(zone){
                setTimeout(function() {                    
                      vm.map.panTo( new google.maps.LatLng(zone.latitude, zone.longitude));
                      vm.map.setZoom(10);                    
                }, 1000);
            }
            
        }

        function panToReports(zone) {

            var latLngBounds = new google.maps.LatLngBounds();
            var id = 1;
         
        	var marker = new google.maps.Marker({
                id: id,
                label: zone.nameZone,
                position: {
                    lat: zone.latitude,
                    lng: zone.longitude
                },
                map: vm.map
            });
            vm.zoneMarkers.push({id: zone.id, marker: marker});



            console.log("vm.zoneMarkers",vm.zoneMarkers);
            
        }


        function load() {
        	$rootScope.loading = true;
            var promise = ZoneService.getZoneAssetsById(SentinelUiSession.focus,$stateParams.zoneId).$promise;
            promise.then(
                function(result) {
                	$rootScope.loading = false;
                    vm.zone = result;
                    initMap(result);
                    console.log("result",result);
                },
                function (error) {
                	$rootScope.loading = false;
                    if (error.status !== 404) {
                        vm.feedback.addError(error);
                    }
                }
            );
        }

        function clearZoneMarker() {
            if (vm.zoneMarkers.length>0) {
            	_.forEach(vm.zoneMarkers,function(m){
            		m.marker.setMap(null);
                	m.marker = null;
            	});
                vm.zoneMarkers = [];
            }
        }


        function reload(){
        	clearAssetMarker();
        	$rootScope.loading = true;
            var promise = ZoneService.getZone(SentinelUiSession.focus,$stateParams.zoneId).$promise;
            promise.then(
                function(result) {
                	$rootScope.loading = false;
                    vm.zone = result;
                    panToReports(result);
            		panToAsset(result);
                    console.log("reload",result);
                },
                function (error) {
                	$rootScope.loading = false;
                    if (error.status !== 404) {
                        vm.feedback.addError(error);
                    }
                }
            );
        }
    }
})();
