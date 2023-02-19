(function() {
    'use strict';

    angular
        .module('ui-sentinel.zones')
        .controller('ZoneTrackingController', ZoneTrackingController);

    ZoneTrackingController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'SentinelUiSession', 'localStorageService', 'ZoneService','FeedbackService', 'MapsConstants'];
    function ZoneTrackingController($rootScope, $scope, $state, $stateParams, SentinelUiSession, localStorageService, ZoneService, FeedbackService, MapsConstants) {
       
        var vm = {
            map: null,
            mapType: MapsConstants.mapTypes.hybrid,
            mapTypes: MapsConstants.mapTypes,
            mapZooms: MapsConstants.zooms,
            mapShapeStyles: MapsConstants.shapes,
            zones: [],
            zoneMarkers: [],
            feedback: FeedbackService,
            selected: null,
            selectedIndex: null,
            nextZone: null,
            previousZone: null,
            filter: {
            	searchText: null,
            	filter: filter
            },
            actions: {
                gotoAddZone: gotoAddZone,
                gotoEditZone: gotoEditZone,
                gotoZone: gotoZone,
                load: load,
                reload: reload,
                selectZone:selectZone,
                closeZoneDetails: closeZoneDetails
            }
        };
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
            
            load();
        }

        function gotoAddZone(){
        	$state.go('zone.new');
        }

        function gotoEditZone(zone){
            $state.go('zone.admin',{ zoneId:zone.id });
        }


        function gotoZone(zone){
            $state.go('zone.tracking-detail',{locationId:$stateParams.locationId,zoneId:zone.id});
        }

        function selectZone(zone){
            vm.selected = zone;

             var index = _.findIndex(vm.zones, function(z) {
                return z.id === zone.id;
            });

            vm.selectedIndex = index;
            vm.nextZone = index === 0 ? null : findNextVisible(index);
            vm.previousZone = index === vm.zones.length - 1 ? null : findPrevVisible(index);
        }

        function findNextVisible(selectedIndex) {
            for(var i = selectedIndex - 1; i >= 0; i--) {
                if (vm.filter.filter(vm.zones[i])) {
                    return vm.zones[i];
                }
            }
            return null;
        }

        function findPrevVisible(selectedIndex) {
            for(var i = selectedIndex + 1; i <= vm.zones.length - 1; i++) {
                if (vm.filter.filter(vm.zones[i])) {
                    return vm.zones[i];
                }
            }
            return null;
        }

        function closeZoneDetails(){
            vm.selected = null;
        }

        function filter(zone) {
            var isTextMatch = true;
            if (vm.filter.searchText) {
                isTextMatch = (
                    zone.zoneName.toLowerCase().indexOf(vm.filter.searchText.toLowerCase()) > -1 ||
                    zone.deviceId.toLowerCase().indexOf(vm.filter.searchText.toLowerCase()) > -1 ||
                    zone.deviceType.toLowerCase().indexOf(vm.filter.searchText.toLowerCase()) > -1 ||
                    (zone.zoneNotes !== null && zone.zoneNotes.toLowerCase().indexOf(vm.filter.searchText.toLowerCase()) > -1)
                );
                var marker = null;
                if(isTextMatch){
                	marker = _.find(vm.zoneMarkers,function(m){return m.id === zone.id;}); 
                	marker.marker.setMap(vm.map);        	               
                } else {
                	marker = _.find(vm.zoneMarkers,function(m){return m.id === zone.id;}); 
                	if(marker && marker.marker){
                		marker.marker.setMap(null);
                		
                	}    
                }
            }

            return isTextMatch;
        }

        function initMap(zones) {

        	 vm.map = new google.maps.Map(document.getElementById("zoneMap"), {
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

            panToReports(zones);
            panToZone(zones);
        }

        function panToZone(zones) {
            if(zones.length>0){
                setTimeout(function() {
                    
                      vm.map.panTo( new google.maps.LatLng(zones[0].latitude, zones[0].longitude));
                      vm.map.setZoom(10);
                    
                }, 1000);
            }
            
        }

        function panToReports(zones) {

            var latLngBounds = new google.maps.LatLngBounds();
            var id = 1;
            _.forEach(zones, function (zone) {
            	var marker = new google.maps.Marker({
	                id: id++,
	                 label: zone.assetsCount.toString(),
	                position: {
	                    lat: zone.latitude,
	                    lng: zone.longitude
	                },
	                map: vm.map
	            });
                vm.zoneMarkers.push({id: zone.id, marker: marker});


            });

            console.log("vm.zoneMarkers",vm.zoneMarkers);
            
        }


        function load() {
        	$rootScope.loading = true;
            var promise = ZoneService.getZonesByLocationAssets(SentinelUiSession.focus,$stateParams.locationId).$promise;
            promise.then(
                function(result) {
                	$rootScope.loading = false;
                    vm.zones = result;
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
        	clearZoneMarker();
        	$rootScope.loading = true;
            var promise = ZoneService.getZonesByLocationAssets(SentinelUiSession.focus,$stateParams.locationId).$promise;
            promise.then(
                function(result) {
                	$rootScope.loading = false;
                    vm.zones = result;
                    panToReports(result);
            		panToZone(result);
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
