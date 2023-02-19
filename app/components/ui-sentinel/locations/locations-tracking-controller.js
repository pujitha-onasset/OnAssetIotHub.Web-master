(function() {
    'use strict';

    angular
        .module('ui-sentinel.locations')
        .controller('LocationTrackingController', LocationTrackingController);

    LocationTrackingController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'SentinelUiSession', 'localStorageService','ZoneService', 'LocationService','FeedbackService', 'MapsConstants'];
    function LocationTrackingController($rootScope, $scope, $state, $stateParams, SentinelUiSession, localStorageService, ZoneService, LocationService, FeedbackService, MapsConstants) {
       
        var vm = {
            map: null,
            mapType: MapsConstants.mapTypes.hybrid,
            mapTypes: MapsConstants.mapTypes,
            mapZooms: MapsConstants.zooms,
            mapShapeStyles: MapsConstants.shapes,
            locations: [],
            zones:[],
            locationMarkers: [],
            feedback: FeedbackService,
            selectedIndex: null,
            nextLocation: null,
            previousLocation: null,
            filter: {
            	searchText: null,
            	filter: filter
            },
            selected:null,
            showMap:true,
            showTable:false,
            actions: {
                gotoAddLocation: gotoAddLocation,
                gotoLocation: gotoLocation,
                gotoEditLocation: gotoEditLocation,
                load: load,
                reload: reload,
                isAnAdmin: isAnAdmin,
                selectLocation:selectLocation,
                selectZone: selectZone,
                closeLocationDetails: closeLocationDetails,
                gotoSightingsForReport: gotoSightingsForReport,
                gotoSightingsByDevice: gotoSightingsByDevice,
                gotoSightingsOfMac: gotoSightingsOfMac, 
                getAsset: getAsset,
                gotoAssetDetails: gotoAssetDetails,
                gotoDetails: gotoDetails,
                navToMap: navToMap,
                navToReports: navToReports
            }
        };
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
            
            load();
        }

        function isAnAdmin(){
            return SentinelUiSession.user && SentinelUiSession.user.isSystemAdmin;
        }

        function gotoAddLocation(){
        	$state.go('location.new');
        }

        function gotoEditLocation(location){
            $state.go('location.admin',{ locationId:location.id });
        }

        function gotoLocation(location){
           $state.go('zones.tracking',{ locationId:location.id });
        }

        function gotoAssetDetails(sentinelId){
            console.log(sentinelId);
            $state.go('asset.details',{sentinelId:sentinelId, zoneId:vm.zone.id});
        }

        function gotoDetails(location){
            console.log("gotoDetails",location);
            $state.go('location.details',{locationId:location.id});
        }

        function getAsset(sentinelId){
            return  _.find(vm.zone.assets, function(a){
                return a.sentinelId === sentinelId;
            });
        }

        function selectLocation(location){

            
            

            console.log("selectLocation",location);
            vm.selected = location;

            var index = _.findIndex(vm.locations, function(l) {
                return l.id === location.id;
            });

            console.log("index",index);

            vm.selectedIndex = index;
            vm.nextLocation = index === 0 ? null : findNextVisible(index);
            vm.previousLocation = index === vm.locations.length - 1 ? null : findPrevVisible(index);

            vm.zone = null;
            vm.showMarken =  true;
            vm.zones = location.zones;

            _.forEach(vm.zones, function (zone) {
                  zone.$selected = false;
            });

            var markerBounds = new google.maps.LatLngBounds();
            var randomPoint = null;
            _.forEach(vm.locations, function(l){
                var marker = _.find(vm.locationMarkers,function(m){
                    return m.id == l.id;
                });
                if(l.id != location.id){
                    marker.marker.setIcon(MapsConstants.icons.trackingLocation.pin.default);
                    marker.marker.setZIndex(google.maps.Marker.MAX_ZINDEX - 1);
                    marker.marker.setMap(null);
                    _.forEach(l.zones, function(z){
                        var zoneMarker = _.find(vm.locationMarkers,function(zM){
                            return zM.id == z.id;
                        });
                        if(z.deviceType=="anchor")
                          zoneMarker.marker.setIcon(MapsConstants.icons.trackingLocation.anchor.default);
                        else
                          zoneMarker.marker.setIcon(MapsConstants.icons.trackingLocation.pin.default);
                        zoneMarker.marker.setZIndex(google.maps.Marker.MAX_ZINDEX - 1);
                        zoneMarker.marker.setMap(null);
                    });
                } else {
                    randomPoint = new google.maps.LatLng( marker.marker.position.lat(), marker.marker.position.lng());
                    markerBounds.extend(randomPoint);
                    marker.marker.setIcon(MapsConstants.icons.trackingLocation.pin.selected);
                    marker.marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
                    marker.marker.setMap(vm.map);
                    marker.marker.setMap(null);
                    _.forEach(l.zones, function(z){
                        var zoneMarker = _.find(vm.locationMarkers,function(zM){
                            return zM.id == z.id;
                        });
                        if(zoneMarker){
                            if(z.deviceType=="anchor")
                              zoneMarker.marker.setIcon(MapsConstants.icons.trackingLocation.anchor.default);
                            else
                              zoneMarker.marker.setIcon(MapsConstants.icons.trackingLocation.pin.default);
                            zoneMarker.marker.setZIndex(google.maps.Marker.MAX_ZINDEX - 1);
                            zoneMarker.marker.setMap(vm.map);
                            randomPoint = new google.maps.LatLng( zoneMarker.marker.position.lat(), zoneMarker.marker.position.lng());
                            markerBounds.extend(randomPoint);
                        }
                    });
                }
            });
            vm.map.fitBounds(markerBounds);
            
        }

        function selectZone(zone){
            console.log("selectZone",zone);
            if(zone.location.clientId === "5243204b-dec4-422a-abe9-07f4566d3e2d"){
                vm.showMarken = false;
            }
            if(!zone.$selected){
                _.forEach(vm.zones, function (zone) {
                  zone.$selected = false;
                });
                zone.$selected = true;
            }else
                zone.$selected = !zone.$selected;
            if(zone.$selected){

                if(zone.assetsCount == 0){
                    vm.zone = zone; 
                    _.forEach(vm.locationMarkers,function(m){   
                            if(m.id != zone.id){
                                if(m.deviceType=="anchor")
                                  m.marker.setIcon(MapsConstants.icons.trackingLocation.anchor.default);
                                else
                                  m.marker.setIcon(MapsConstants.icons.trackingLocation.pin.default);
                                m.marker.setZIndex(google.maps.Marker.MAX_ZINDEX - 1);
                            } else {
                                if(m.deviceType=="anchor")
                                  m.marker.setIcon(MapsConstants.icons.trackingLocation.anchor.selected);
                                else
                                  m.marker.setIcon(MapsConstants.icons.trackingLocation.pin.selected);
                                m.marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
                            }
                    });
                    return;
                }

                $rootScope.loading = true;
                var promise = ZoneService.getZoneAssetsById(SentinelUiSession.focus,zone.id).$promise;
                promise.then(
                    function(result) {
                        $rootScope.loading = false;
                        vm.zone = result;                   
                        console.log("Zoneresult",result);
                        _.forEach(vm.locationMarkers,function(m){
                            if(m.id != zone.id){
                                if(m.deviceType=="anchor")
                                  m.marker.setIcon(MapsConstants.icons.trackingLocation.anchor.default);
                                else
                                  m.marker.setIcon(MapsConstants.icons.trackingLocation.pin.default);
                                m.marker.setZIndex(google.maps.Marker.MAX_ZINDEX - 1);
                            } else {
                               if(m.deviceType=="anchor")
                                  m.marker.setIcon(MapsConstants.icons.trackingLocation.anchor.selected);
                                else
                                  m.marker.setIcon(MapsConstants.icons.trackingLocation.pin.selected);
                                m.marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
                            }
                        });
                        // _.forEach(vm.zone.sentinelsStatus,function(m){
                        //    if(m.beaconType === "Sentinel 100B"){
                            
                        //    }
                        // });
                    },
                    function (error) {
                        $rootScope.loading = false;
                        if (error.status !== 404) {
                            vm.feedback.addError(error);
                        }
                    }
                );
            }else{
                _.forEach(vm.locationMarkers,function(m){
                    m.marker.setIcon(MapsConstants.icons.trackingLocation.pin.default);
                    m.marker.setZIndex(google.maps.Marker.MAX_ZINDEX - 1);    
                });
                vm.zone = null;

            }
        }

        function findNextVisible(selectedIndex) {
            for(var i = selectedIndex - 1; i >= 0; i--) {
                if (vm.filter.filter(vm.locations[i])) {
                    return vm.locations[i];
                }
            }
            return null;
        }

        function findPrevVisible(selectedIndex) {
            for(var i = selectedIndex + 1; i <= vm.locations.length - 1; i++) {
                if (vm.filter.filter(vm.locations[i])) {
                    return vm.locations[i];
                }
            }
            return null;
        }

        function closeLocationDetails(){
            vm.selected = null;
            reload();
        }

        function filter(location) {
            var isTextMatch = true;
            if (vm.filter.searchText) {
                isTextMatch = (
                    location.name.toLowerCase().indexOf(vm.filter.searchText.toLowerCase()) > -1 ||
                    location.address.toLowerCase().indexOf(vm.filter.searchText.toLowerCase()) > -1 ||
                    (location.description !== null && location.description.toLowerCase().indexOf(vm.filter.searchText.toLowerCase()) > -1)
                );
                var marker = null;
                if(isTextMatch){
                	marker = _.find(vm.locationMarkers,function(m){return m.id === location.id;}); 
                	marker.marker.setMap(vm.map);        	               
                } else {
                	marker = _.find(vm.locationMarkers,function(m){return m.id === location.id;}); 
                	if(marker && marker.marker){
                		marker.marker.setMap(null);
                		
                	}    
                }
            }

            return isTextMatch;
        }

        function initMap(locations) {

        	vm.map = new google.maps.Map(document.getElementById("locationTrackingMap"), {
                zoom: vm.mapZooms.geofenceDefault.zoomLevel,
                center: vm.mapZooms.geofenceDefault.center,
                mapTypeId: vm.mapType.type,
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
            if(locations.length)
              panToReports(locations);
            
           
        }

        function onWindowResize() {
            if ($state.current.name !== 'locations.tracking') {
                return;
            }
            
            var center = vm.map.getCenter();

            var newHeight = window.innerHeight * 0.60;
            var mapDiv = document.getElementById("locationTrackingMap");
            mapDiv.style.height = Math.round(newHeight) + 'px';

            //var mapItemListDiv = document.getElementById('map-items-list');
            //mapItemListDiv.style.height = (Math.round(newHeight) + 172) + 'px';

            google.maps.event.trigger(vm.map, 'resize');
            vm.map.setCenter(center);
        }


        function panToReports(locations) {
        
             vm.locationMarkers = [];
            setTimeout(function(){
                var markerBounds = new google.maps.LatLngBounds();
                var randomPoint;
                var id = 1;
                _.forEach(locations, function (location) {
                    randomPoint = new google.maps.LatLng( location.latitude, location.longitude);
                    var marker = new google.maps.Marker({
                        id: id++,
                        icon: MapsConstants.icons.trackingLocation.pin.default,
                         label: {
                          text: location.assetsCount.toString(),
                          fontSize:"16px",
                          fontWeight:"bold"
                        },
                        position: randomPoint,
                        map: vm.map
                    });
                    vm.locationMarkers.push({id: location.id, marker: marker});

                    markerBounds.extend(randomPoint);

                    marker.addListener('click', function() {
                       
                       selectLocation(location);
                       $scope.$apply();

                    });

                    _.forEach(location.zones, function(zone){
                        randomPoint = new google.maps.LatLng( zone.latitude, zone.longitude);
                        var marker=null;
                        if(zone.deviceType=="anchor"){
                            marker = new google.maps.Marker({
                                id: id++,
                                icon: MapsConstants.icons.trackingLocation.anchor.default,
                                position: randomPoint,
                                map: null
                            });
                        }else{
                            marker = new google.maps.Marker({
                                id: id++,
                                icon: MapsConstants.icons.trackingLocation.pin.default,
                                label: {
                                  text: zone.assetsCount.toString(),
                                  fontSize:"16px",
                                  fontWeight:"bold"
                                },
                                position: randomPoint,
                                map: null
                            });
                        }

                       


                        vm.locationMarkers.push({id: zone.id, marker: marker,deviceType:zone.deviceType});

                        //markerBounds.extend(randomPoint);


                        marker.addListener('click', function() {
                           selectZone(zone);
                            $scope.$apply();
                        });
                    });
                });

                vm.map.fitBounds(markerBounds);

                console.log("vm.locationMarkers",vm.locationMarkers);
            },500);
            
            
        }


        function load() {
        	$rootScope.loading = true;
            var promise = LocationService.getLocationsAssetsZones(SentinelUiSession.focus).$promise;
            promise.then(
                function(result) {
                	$rootScope.loading = false;
                    vm.locations = result;
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

        
        function gotoSightingsForReport(report) {
            $state.go('sightings.for-report', { reportId: report.sentryStatusId });
        }

        function gotoSightingsByDevice(report) {
            var from = moment(report.timeOfReceipt).subtract(1, 'days').toISOString();
            $state.go('sightings.by-device', { imei: report.imei, to: report.timeOfReceipt, from: from});
        }

        function gotoSightingsOfMac(report) {
            var from = moment(report.timeOfReceipt).subtract(1, 'days').toISOString();
            $state.go('sightings.of-mac', { mac: report.sightingId, to: report.timeOfReceipt, from: from});
        }

        function clearLocationMarker() {
            if (vm.locationMarkers.length>0) {
            	_.forEach(vm.locationMarkers,function(m){
            		m.marker.setMap(null);
                	m.marker = null;
            	});
                vm.locationMarkers = [];
            }
        }


        function reload(){
            var promise = null;
            if(vm.selected == null){
                	clearLocationMarker();
                	$rootScope.loading = true;
                    promise = LocationService.getLocationsAssetsZones(SentinelUiSession.focus).$promise;
                    promise.then(
                        function(result) {
                        	$rootScope.loading = false;
                            vm.locations = result;
                            panToReports(result);
                    		console.log("reload",result);
                        },
                        function (error) {
                        	$rootScope.loading = false;
                            if (error.status !== 404) {
                                vm.feedback.addError(error);
                            }
                        }
                    );
            } else {
               $rootScope.loading = true;
                promise = LocationService.getLocationAssetsZones(SentinelUiSession.focus, vm.selected.id).$promise;
                promise.then(
                    function(result) {
                        $rootScope.loading = false;
                        if(result && result.length>0){
                            console.log("reload locationselected",result[0]);
                            vm.selected = result[0];

                            var index = _.indexOf(vm.locations,_.find(vm.locations, function(l){
                                return l.id == vm.selected.id;
                            }));

                            vm.locations.splice(index, 1, vm.selected);

                            _.forEach(vm.locationMarkers,function(m){
                                var zone = _.find(vm.selected.zones,function(z){
                                    return z.id === m.id;
                                });
                                if(zone){
                                    var label = m.marker.getLabel();
                                    label.text = zone.assetsCount.toString();
                                    m.marker.setLabel(label);
                                }
                                
                            });

                            selectLocation(vm.selected);
                        }
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
