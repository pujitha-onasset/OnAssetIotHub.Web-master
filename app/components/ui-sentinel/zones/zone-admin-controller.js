(function() {
    'use strict';

    angular
        .module('ui-sentinel.zones')
        .controller('ZoneAdminController', ZoneAdminController);

    ZoneAdminController.$inject = ['$rootScope', '$scope', '$state', '$stateParams',
    'AnchortagsService', 'SentinelUiSession', 'localStorageService','LocationService', 
    'ZonesDataService','SentryAccountApiService','ZoneService', 'FeedbackService', 'MapsConstants'];
    function ZoneAdminController($rootScope, $scope, $state, $stateParams, AnchortagsService, SentinelUiSession, 
        localStorageService, LocationService, ZonesDataService, SentryAccountApiService, ZoneService, FeedbackService, 
        MapsConstants) {
       
        var vm = {
            map: null,
            mapType: MapsConstants.mapTypes.hybrid,
            mapTypes: MapsConstants.mapTypes,
            mapZooms: MapsConstants.zooms,
            mapShapeStyles: MapsConstants.shapes,
            zone: null,
            zones: [],
            anchor: null,
            imagesToUpload: [],
            imagesStored: [],
            availableDevices: [],
            locationLimit: 5,
            zoneName: {
                value: null,
                isPristine: true,
                errors: {
                    isBlank: true,
                    isDuplicate: true
                },
                hasError: function() {
                    return this.errors.isBlank || this.errors.isDuplicate;
                },
                validate: function() {
                    this.isPristine = false;
                    this.errors.isDuplicate = false;
                    this.errors.isBlank = !this.value;
                }
            },
            zoneDescription: {
                value: null
            },
            device: {
                value: null,
                valueText: null,
                searchText: null,
                type: "Sentry",
                isPristine: true,
                hasError: function () {
                    return this.value === null;
                },
                errors: {
                    isBlank: true,
                    isNotFound: false
                },
                validate: validateDevice
            },
            locationSearch: {
                value: null,
                isPristine: true,
                locations: [],
                errors: {
                    isBlank: true,
                    hasZeroResults: false
                },
                hasError: function() {
                    return this.errors.isBlank || this.errors.hasZeroResults;
                },
                validate: function() {
                    this.isPristine = false;
                    this.errors.hasZeroResults = false;
                    this.errors.isBlank = !this.value;
                }
            },            
            zoneAddress: {
                value: null,
                location: null,
                isPristine: true,
                errors: {
                    isBlank: true,
                    isLocationBlank: true
                },
                hasError: function() {
                    return this.errors.isBlank || this.errors.isLocationBlank;
                },
                validate: validateLocation
            },
            mode: {
                isNew: false,
                isSaving: false,
                isRemoving: false,
                isChangingLocation: false
            },
            hasPermission: {
                toSave: false
            },
            feedback: FeedbackService,
            actions: {
                close: close,
                beginRemove: beginRemove,
                cancelRemove: cancelRemove,
                remove: remove,
                reset: reset,
                submit: submit,
                calculateSize: calculateSize,
                removeImage: removeImage,
                getLocations: getLocations,
                changeLocation: changeLocation,
                selectLocation: selectLocation,
                panToLocation: panToLocation,
                locationSearchChanged: locationSearchChanged,
                clearDevice: clearDevice,
                changeDeviceType: changeDeviceType,
                changeDeviceFilter: changeDeviceFilter,
                selectDevice: selectDevice,
                gotoNewZone: gotoNewZone
            }
        };
        activate();

       

        return vm;

        

        ////////////////////////////////////////////

        function activate() {
             

            console.log("ZoneAdmin page");
            setPermissions();
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($state.current.name === 'zone.admin' || $state.current.name === 'zone.new') {
                    ZonesDataService.load();
                    $state.go('zone.list');
                }
            });

            $rootScope.$on("zoneUploadImageListener", function(event, data){
                console.log("zoneUploadImageListener",data);
                vm.imagesToUpload = data;
            });

            initMap();

            if ($stateParams.zoneId) { //edit mode
                console.log("edit mode");
                load();
            }
            else if($stateParams.locationId){ //mode new
                console.log("new mode");
                vm.mode.isNew = true;
                reset();                
            }
        }

        function gotoNewZone(){
             $state.go('zone.new',{locationId:vm.zone.locationId});
        }

        function calculateSize(filesize){
            return ((filesize/(1024*1024)) > 1)? (filesize/(1024*1024)) + ' MB' : (filesize/        1024)+' KB';
        }

        function removeImage(image, index){
             $rootScope.loading = true;
            var promise = ZoneService.removeImage(image.name).$promise;

            promise.then(
                function(result) {
                    console.log("removed",result);
                    $rootScope.loading = false;
                    vm.imagesStored.splice(index,1);
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                   $rootScope.loading = false;
            });
            
        }
        
        function validateDevice() {
            vm.device.isPristine = false;
            vm.device.errors.isNotFound = false;
            vm.device.errors.isBlank = vm.device.value === null;
            if (vm.device.errors.isBlank) {
                return;
            }
        }
        
        function clearDevice() {
            vm.device.value = null;
            vm.device.valueText = null;
            vm.device.searchText = null;
            vm.device.isPristine = true;
        }

        function changeDeviceType(type) {
            if(vm.device.type !== type){
                console.log("changeDeviceType",type);
                vm.device.type = type;
                vm.availableDevices = [];
                clearDevice();
                loadDevices();
            }
        }

        function loadDevices() {
            $rootScope.loading = true;
            vm.availableDevices = [];

            var promise = vm.device.type.toLowerCase() == "sentry" ?
                SentryAccountApiService.getDevicesForASML(SentinelUiSession.focus,"1").$promise :
                AnchortagsService.searchBySentinelId(SentinelUiSession.focus,"1").$promise;

            promise.then(
                function(result) {
                    console.log(result);
                    vm.availableDevices = result;
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }
        
        function changeDeviceFilter(filter){

            if(filter === "" || filter === null)
                filter = "1";

            console.log("changeDeviceFilter",filter);

            $rootScope.loading = true;
            var promise = vm.device.type.toLowerCase() == "sentry" ?  
                SentryAccountApiService.getDevicesForASML(SentinelUiSession.focus,filter).$promise : 
                AnchortagsService.searchBySentinelId(SentinelUiSession.focus,filter).$promise;

            promise.then(
                function(result) {
                    console.log("Sentys",result);
                    vm.availableDevices = result;
                    //onReportsChange();
                },
                function(error) {
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                   $rootScope.loading = false;
            });
            
        }

        function loadAnchor(mac){
            var promise = AnchortagsService.getAnchorTagsBySentinel(mac).$promise;
            promise.then(
                function(result) {
                    if (typeof result.sentinelId !== "undefined") {
                        vm.anchor = result;
                    }
                },
                function (error) {
                    console.log("loadAnchor error",error);
                }
            );
        }

        function selectDevice(device) {
            vm.device.isPristine = false;
            vm.device.value = device;
            if(vm.device.type.toLowerCase() == 'sentry')
                vm.device.valueText = device.imei;
            else {
                vm.device.valueText = device.mac;
                loadAnchor(device.mac);
            }
        }
        
        function beginRemove() {
            vm.mode.isRemoving = true;
        }

        function cancelRemove() {
            vm.mode.isRemoving = false;
        }

        
        function changeLocation() {
            vm.mode.isChangingLocation = true;
            vm.centerLatLng = null;
            vm.zoneAddress.location = null;
            vm.locationSearch.isPristine = true;
            vm.locationSearch.errors.isBlank = true;
            vm.locationSearch.errors.hasZeroResults = false;
            vm.locationSearch.locations = [];

            if (!vm.locationSearch.value) {
                vm.locationSearch.value = vm.zone ? vm.zone.address : null;
            }

            clearLocationMarker();

           
        }

        function clearLocationMarker() {
            if (vm.zoneAddress.locationMarker) {
                vm.zoneAddress.locationMarker.setMap(null);
                vm.zoneAddress.locationMarker = null;
            }
        }

        function close() {
            vm.zone = null;
            $state.go($stateParams.referrer, $stateParams.referrerParams);            
        }


        function getLocations() {
            vm.locationSearch.validate();
            if (vm.locationSearch.hasError()) {
                return;
            }

            vm.locationSearch.locations = [];
            var geoCoder = new google.maps.Geocoder();
            geoCoder.geocode({ 'address': vm.locationSearch.value}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {

                    if (results.length === 1) {
                        selectLocation(results[0].geometry.location.lat(),results[0].geometry.location.lng());
                    }
                    else {
                        vm.locationSearch.locations = results;
                    }
                }
                else {
                    vm.locationSearch.errors.hasZeroResults = true;
                }

                $scope.$apply();
            });
        }

        function initMap() {
            vm.map = new google.maps.Map(document.getElementById('locationMap'), {
                zoom: vm.mapZooms.geofenceDefault.zoomLevel,
                center: vm.mapZooms.geofenceDefault.center,
                mapTypeId: vm.mapType.type,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.TERRAIN]
                }
            });

            vm.map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('centerZoomLabel'));
            vm.map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('locationZoom'));
      
        }

        function load() {
            var promise = ZoneService.getZone(SentinelUiSession.focus,$stateParams.zoneId).$promise;
            promise.then(
                function(result) {
                    vm.zone = result;
                    console.log("Zone GET",vm.zone);
                    console.log("latitude",vm.zone.latitude);
                    console.log("longitude",vm.zone.longitude);
                    reset();
                },
                function (error) {
                    if (error.status !== 404) {
                        vm.feedback.addError(error);
                    }
                }
            ).finally(function(){
                loadDevices();
            });

            
        }



        function locationSearchChanged() {
            vm.zoneAddress.isPristine = true;
            vm.locationSearch.isPristine = true;
        }


        function remove() {
            vm.feedback.clear();

            var promise = ZoneService.removeZone(SentinelUiSession.focus,vm.zone).$promise;
            promise.then(
                function(result) {
                    vm.mode.isRemoving = false;
                    ZonesDataService.load();
                    $state.go('zones.list');
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function reset() {

            
            vm.mode.isChangingLocation = vm.mode.isNew;

            var LocationId = null;

            if (!vm.mode.isNew) {

                console.log("reset edit mode");
                LocationId = vm.zone.locationId;
                $state.current.data.subTitle = vm.zone.zoneName;
                vm.zoneName.value = vm.zone.zoneName;
                vm.locationSearch.value = vm.zone.zoneA;                
                vm.zoneAddress.location = null;
                vm.zoneDescription.value = vm.zone.zoneNotes;
                vm.device.type = vm.zone.deviceType;
                if(vm.device.type.toLowerCase() == 'sentry')
                    vm.actions.selectDevice({imei:vm.zone.deviceId});
                else {
                    vm.actions.selectDevice({mac:vm.zone.deviceId});
                    loadAnchor(vm.zone.deviceId);
                }
                
                console.log("zone reset",vm.zone);
                selectLocation(vm.zone.latitude,vm.zone.longitude);
               
                var imagesPromise = ZoneService.getImages($stateParams.zoneId).$promise;
                imagesPromise.then(
                    function(result) {
                        vm.imagesStored = result;
                       console.log("imagesStored",result);
                    },
                    function (error) {
                        if (error.status !== 404) {
                            vm.feedback.addError(error);
                        }
                    }
                );


                
            }
            else {
                console.log("reset new mode");

                LocationId = $stateParams.locationId;
                vm.zoneName.value = null;
                vm.zoneDescription.value = null;
                vm.locationSearch.value = null;
                vm.zoneAddress.value = null;
                vm.zoneAddress.location = null;
                vm.device.value = null;
                vm.device.valueText=null;
                vm.device.searchText=null;
                vm.device.type="Sentry";
                vm.device.isPristine=true;
                vm.imagesToUpload.splice(0,vm.imagesToUpload.length);
                vm.imagesStored=[];
                vm.availableDevices=[];

                var promise = LocationService.getLocation(SentinelUiSession.focus,$stateParams.locationId).$promise;
                    promise.then(
                        function(result) {
                           vm.locationSearch.value = result.address;
                           selectLocation(result.latitude,result.longitude);
                        },
                        function (error) {
                            if (error.status !== 404) {
                                vm.feedback.addError(error);
                            }
                        }
                    );
            }



            vm.zoneName.isPristine = true;
            vm.zoneName.errors.isBlank = true;
            vm.zoneName.errors.isDuplicate = false;
            
            vm.zoneAddress.isPristine = true;
            vm.zoneAddress.errors.isBlank = true;

            vm.locationSearch.locations = [];
            vm.locationSearch.isPristine = true;
            vm.locationSearch.errors.isBlank = true;
            vm.locationSearch.errors.hasZeroResults = false;

            clearLocationMarker();
            loadDevices();

            var getZonesPromise = ZoneService.getZonesByLocation(SentinelUiSession.focus,LocationId ).$promise;
            getZonesPromise.then(
                function(result) {
                    vm.zones = result;
                    if(!vm.mode.isNew){
                        _.remove(vm.zones,function(zone){
                            return zone.id === vm.zone.id;
                        });
                    }
                    console.log("zones",vm.zones);

                    _.forEach(vm.zones,function(z){
                        var guid = 2;
                        var point = {lat: z.latitude,lng: z.longitude};
                         var marker = new google.maps.Marker({
                            id: guid++,
                            position: point,
                            map: vm.map,
                            draggable:false
                        });
                    });
                },
                function (error) {
                   vm.feedback.addError(error.data.message);
                }
            );

        }

        function selectLocation(lat, lng) {
            console.log("select location",location);
            vm.mode.isChangingLocation = false;
            vm.zoneAddress.value = location.formatted_address;
            vm.zoneAddress.location = location;
             setTimeout(function(){
                    var point = {lat: lat,lng: lng};
                    vm.zoneAddress.locationMarker = new google.maps.Marker({
                            id: 1,
                            icon: MapsConstants.icons.trackingLocation.pin.selected,
                            position: point,
                            map: vm.map,
                            draggable:true
                        });
                    panToLocation(point);
                    validateLocation();

                    google.maps.event.addListener(vm.zoneAddress.locationMarker, 'dragend', function(position) {
                        vm.zoneAddress.locationMarker.setPosition(this.getPosition());
                        console.log("latitude changed",vm.zoneAddress.locationMarker.getPosition().lat());
                        console.log("longitude changed",vm.zoneAddress.locationMarker.getPosition().lng());
                    });
            },500);

        }

        function panToLocation(point) {
             if (point) {
                var markerBounds = new google.maps.LatLngBounds();
                markerBounds.extend(point);
                vm.map.fitBounds(markerBounds);
            }
        }

        function setPermissions() {
            vm.hasPermission.toSave =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;
        }


        function submit() {

            console.log("submit");
            vm.feedback.clear();

            vm.zoneName.validate();
            vm.device.validate();
            vm.locationSearch.validate();

            if (vm.zoneName.hasError() || vm.device.hasError()) {
                return;
            }

            var zone = {
                zoneName: vm.zoneName.value,
                zoneNotes: vm.zoneDescription.value,
                zoneLatitude:vm.zoneAddress.locationMarker.getPosition().lat(),
                zoneLongitude:vm.zoneAddress.locationMarker.getPosition().lng(),
                deviceType: vm.device.type.toLowerCase(),
                deviceId: vm.device.valueText

            };
            
            if (!vm.mode.isNew) {
                zone.id = vm.zone.id;
                zone.locationId = vm.zone.locationId;
            } else {
                zone.locationId = $stateParams.locationId;
            }

            console.log("zone to update",zone);


            var promise = vm.mode.isNew ?
                ZoneService.saveZone(SentinelUiSession.focus, zone).$promise :
                ZoneService.updateZone(SentinelUiSession.focus, zone).$promise;
            $rootScope.loading = true;
            if(zone.deviceType == "anchor"){
                
                vm.anchor.anchorName = zone.zoneName;
                vm.anchor.description =  zone.zoneNotes;
                vm.anchor.latitude = zone.zoneLatitude;
                vm.anchor.longitude = zone.zoneLongitude;


                var promiseAnchor = AnchortagsService.postAnchorTagsBySentinel(vm.anchor).$promise;
                promiseAnchor.then(
                    function (result) {
                        console.log("Anchor update",result);
                    },
                    function (error) {
                        console.log("Anchor update error",error);
                    }
                );
            }

            promise.then(
                function (result) {
                    vm.zone = result;
                    var message = vm.zone.zoneName + ' has been ' + (vm.mode.isNew ? 'created' : 'updated');

                    //ZonesDataService.load();

                    if(vm.imagesToUpload.length>0){

                        var promises = [];

                        vm.imagesToUpload.forEach(function(image, index, arrayObj){
                            promises.push(ZoneService.addImage(SentinelUiSession.focus,vm.zone.id,image.type, image).$promise);
                        });

                        

                        Promise.all(promises)
                            .then(function(){
                                $rootScope.loading = false;
                                vm.imagesToUpload.splice(0,vm.imagesToUpload.length);

                                if (vm.mode.isNew) {
                                    $state.go('zone.admin', { zoneId: result.id});
                                    vm.feedback.addSuccess(message);
                                    return;
                                }

                                 load();
                                vm.feedback.addSuccess(message);
                            })
                            .catch(function(e){
                                // handle errors here
                                $rootScope.loading = false;
                                console.log(e);
                            });            

                    
                    } else {
                        $rootScope.loading = false;
                        if (vm.mode.isNew) {
                            $state.go('zone.admin', { zoneId: result.id});
                            vm.feedback.addSuccess(message);
                            return;
                        }

                        load();
                        vm.feedback.addSuccess(message);
                    }
                },
                function (error) {
                    $rootScope.loading = false;
                    if (error.status === -1) {
                        vm.feedback.addError('Unable to connect to server.  Please try again later.');
                        return;
                    }

                    if (error.status === 400 && error.data.message.indexOf('already exists') > -1) {
                        vm.geofenceName.errors.isDuplicate = true;
                        return;
                    }

                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function validateLocation() {
            vm.zoneAddress.isPristine = false;
            vm.zoneAddress.errors.isBlank = !vm.zoneAddress.value;
            vm.zoneAddress.errors.isLocationBlank = vm.mode.isChangingLocation && !vm.locationSearch.location;
        }

    }
})();
