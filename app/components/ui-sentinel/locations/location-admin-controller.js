(function() {
    'use strict';

    angular
        .module('ui-sentinel.locations')
        .controller('LocationAdminController', LocationAdminController);

    LocationAdminController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'SentinelUiSession', 'localStorageService','LocationsDataService', 'LocationService','FeedbackService', 'MapsConstants'];
    function LocationAdminController($rootScope, $scope, $state, $stateParams, SentinelUiSession, localStorageService, LocationsDataService,LocationService, FeedbackService, MapsConstants) {
       
        var vm = {
            map: null,
            maxZoomService : null,
            mapType: MapsConstants.mapTypes.hybrid,
            mapTypes: MapsConstants.mapTypes,
            mapZooms: MapsConstants.zooms,
            mapShapeStyles: MapsConstants.shapes,
            geoCoder : new google.maps.Geocoder(),
            location: null,
            responsivenessArray:[1,2,3,4],
            locationLimit: 5,
            locationName: {
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
            locationDescription: {
                value: null
            },
            locationResponsiveness: {
                value: 1
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
            locationAddress: {
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
                getLocations: getLocations,
                changeLocation: changeLocation,
                selectLocation: selectLocation,
                panToLocation: panToLocation,
                locationSearchChanged: locationSearchChanged
            }
        };
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
            setPermissions();
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($state.current.name === 'location.admin' || $state.current.name === 'location.new') {
                    LocationsDataService.load();
                    $state.go('locations.list');
                }
            });

            initMap();

            if ($stateParams.locationId) {
                load();
            }
            else {
                vm.mode.isNew = true;
                reset();                
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
            vm.locationAddress.location = null;
            vm.locationSearch.isPristine = true;
            vm.locationSearch.errors.isBlank = true;
            vm.locationSearch.errors.hasZeroResults = false;
            vm.locationSearch.locations = [];

            if (!vm.locationSearch.value) {
                vm.locationSearch.value = vm.location ? vm.location.address : null;
            }

            clearLocationMarker();

           
        }

        function clearLocationMarker() {
            if (vm.locationAddress.locationMarker) {
                vm.locationAddress.locationMarker.setMap(null);
                vm.locationAddress.locationMarker = null;
            }
        }

        function close() {
            vm.location = null;
            $state.go($stateParams.referrer, $stateParams.referrerParams);            
        }


        function getLocations() {
            vm.locationSearch.validate();
            if (vm.locationSearch.hasError()) {
                return;
            }

            vm.locationSearch.locations = [];
           
            vm.geoCoder.geocode({ 'address': vm.locationSearch.value}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {

                    if (results.length === 1) {
                        selectLocation(results[0]);
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
            vm.MaxZoomService = new google.maps.MaxZoomService();
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
            google.maps.event.addListener(vm.map, 'idle', handleIdle);
            //vm.map.panToLocation = panToLocation;
        }

        function load() {
            var promise = LocationService.getLocation(SentinelUiSession.focus,$stateParams.locationId).$promise;
            promise.then(
                function(result) {
                    vm.location = result;
                    reset();
                },
                function (error) {
                    if (error.status !== 404) {
                        vm.feedback.addError(error);
                    }
                }
            );
        }



        function locationSearchChanged() {
            vm.locationAddress.isPristine = true;
            vm.locationSearch.isPristine = true;
        }


        function remove() {
            vm.feedback.clear();

            var promise = LocationService.removeLocation(SentinelUiSession.focus,vm.location).$promise;
            promise.then(
                function(result) {
                    vm.mode.isRemoving = false;
                    LocationsDataService.load();
                    $state.go('locations.list');
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function reset() {
            vm.mode.isChangingLocation = vm.mode.isNew;

            
            if (!vm.mode.isNew) {
                $state.current.data.subTitle = vm.location.name;
                vm.locationName.value = vm.location.name;
                vm.locationSearch.value = vm.location.address;                
                vm.locationAddress.value = vm.location.address;
                vm.locationAddress.location = null;
                vm.locationDescription.value = vm.location.description;
                vm.locationResponsiveness.value = vm.location.responsiveness;             
                setTimeout(function(){
                
                 var point = {lat: vm.location.latitude,lng: vm.location.longitude};
                    vm.locationAddress.locationMarker = new google.maps.Marker({
                        id: 1,
                        position: point,
                        map: vm.map,
                        draggable:true
                    });
                    google.maps.event.addListener(vm.locationAddress.locationMarker, 'dragend', function(position) {
                        vm.locationAddress.locationMarker.setPosition(this.getPosition());
                        var latlng = new google.maps.LatLng(this.getPosition().lat(), this.getPosition().lng());
                        vm.geoCoder.geocode({'latLng': latlng}, function(results, status) {
                              if (status === 'OK') {
                                if (results[0]) {
                                  vm.locationAddress.value = results[0].formatted_address;
                                  vm.locationSearch.value = results[0].formatted_address;
                                  $scope.$apply();                             
                                } else {
                                  console.log('No results found');
                                }
                              } else {
                               console.log('Geocoder failed due to: ' + status);
                              }
                         });
                        console.log("latitude changed",vm.locationAddress.locationMarker.getPosition().lat());
                        console.log("longitude changed",vm.locationAddress.locationMarker.getPosition().lng());
                    });
                    if(vm.location.settings){
                        var settings = JSON.parse(vm.location.settings);
                        vm.map.setCenter(new google.maps.LatLng(settings.mapCenter.lat, settings.mapCenter.lng));
                        setTimeout(function(){
                           vm.map.setZoom(settings.mapZoom);
                        },500);
                    }else{
                        panToLocation(point);
                    }
                },500);
            }
            else {
                vm.locationName.value = null;
                vm.locationDescription.value = null;
                vm.locationSearch.value = null;
                vm.locationAddress.value = null;
                vm.locationAddress.location = null;
                vm.locationResponsiveness.value = 1;
            }

            vm.locationName.isPristine = true;
            vm.locationName.errors.isBlank = true;
            vm.locationName.errors.isDuplicate = false;
            
            vm.locationAddress.isPristine = true;
            vm.locationAddress.errors.isBlank = true;

            vm.locationSearch.locations = [];
            vm.locationSearch.isPristine = true;
            vm.locationSearch.errors.isBlank = true;
            vm.locationSearch.errors.hasZeroResults = false;

            clearLocationMarker();

        }

        function selectLocation(location) {
            console.log("select location",location);
            vm.mode.isChangingLocation = false;
            vm.locationAddress.value = location.formatted_address;
            vm.locationAddress.location = location;
            var point = {lat: location.geometry.location.lat(),lng: location.geometry.location.lng()};
            vm.locationAddress.locationMarker = new google.maps.Marker({
                id: 1,
                position: point,
                map: vm.map,
                draggable:true
            });
            google.maps.event.addListener(vm.locationAddress.locationMarker, 'dragend', function(position) {
                    vm.locationAddress.locationMarker.setPosition(this.getPosition());
                    var latlng = new google.maps.LatLng(this.getPosition().lat(), this.getPosition().lng());   
                    vm.geoCoder.geocode({'latLng': latlng}, function(results, status) {
                          if (status === 'OK') {
                            if (results[0]) {
                              vm.locationAddress.value = results[0].formatted_address;  
                               vm.locationSearch.value = results[0].formatted_address; 
                               $scope.$apply();                            
                            } else {
                              console.log('No results found');
                            }
                          } else {
                           console.log('Geocoder failed due to: ' + status);
                          }
                     });

                        console.log("latitude changed",vm.locationAddress.locationMarker.getPosition().lat());
                        console.log("longitude changed",vm.locationAddress.locationMarker.getPosition().lng());
            });
            panToLocation(point);
            validateLocation();
        }

        function panToLocation(point) {
            if (point) {
                var markerBounds = new google.maps.LatLngBounds();
                markerBounds.extend(point);
                vm.map.fitBounds(markerBounds);
                showMaxZoom(point);
            }
        
        }

        function showMaxZoom(point) {
          vm.MaxZoomService.getMaxZoomAtLatLng(new google.maps.LatLng(point.lat, point.lng), function(response) {
            if (response.status !== 'OK') {
              console.log(response);
            } else {
              setTimeout(function(){
                vm.map.setZoom(response.zoom);
              },100);
            }
            
          });
        }

        function setPermissions() {
            vm.hasPermission.toSave =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;
        }

        function handleIdle() {
            vm.center = {
                lat: Math.round(vm.map.getCenter().lat() * 1000000) / 1000000,
                lng: Math.round(vm.map.getCenter().lng() * 1000000) / 1000000
            };
            vm.zoomLevel = vm.map.getZoom();
        }



        function submit() {
            vm.feedback.clear();

            vm.locationName.validate();
            vm.locationAddress.validate();
            vm.locationSearch.validate();

            if (vm.locationName.hasError() || vm.locationAddress.hasError()) {
                return;
            }

            var set={"mapCenter":vm.center,"mapZoom":vm.zoomLevel};
            var location = {
                name: vm.locationName.value,
                address: vm.locationAddress.value,
                latitude:vm.locationAddress.locationMarker.position.lat(),
                longitude:vm.locationAddress.locationMarker.position.lng(),
                description: vm.locationDescription.value,
                responsiveness: vm.locationResponsiveness.value,
                settings: JSON.stringify(set)
            };
            if (!vm.mode.isNew) {
                location.id = vm.location.id;
            }

            var promise = vm.mode.isNew ?
                LocationService.saveLocation(SentinelUiSession.focus, location).$promise :
                LocationService.updateLocation(SentinelUiSession.focus,location).$promise;

            promise.then(
                function (result) {
                    vm.location = result;
                    var message = vm.location.name + ' has been ' + (vm.mode.isNew ? 'created' : 'updated');

                    LocationsDataService.load();
                    if (vm.mode.isNew) {
                        $state.go('location.admin', { locationId: result.id});
                        vm.feedback.addSuccess(message);
                        return;
                    }
                    reset();

                    vm.feedback.addSuccess(message);
                },
                function (error) {
                    if (error.status === -1) {
                        vm.feedback.addError('Unable to connect to server.  Please try again later.');
                        return;
                    }

                    if (error.status === 400 && error.data.message.indexOf('already exists') > -1) {
                        vm.geofenceName.errors.isDuplicate = true;
                        return;
                    }

                    if (error.status === 400 && error.data.message.indexOf('Invalid polygon') > -1) {
                        vm.shapeText.errors.isNotValidPolygon = true;
                        return;
                    }

                    if (error.status === 400 && error.data.modelState && error.data.modelState['geofence.ShapeText']) {
                        vm.shapeText.errors.isNotValidPolygon = true;
                        return;
                    }

                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function validateLocation() {
            vm.locationAddress.isPristine = false;
            vm.locationAddress.errors.isBlank = !vm.locationAddress.value;
            vm.locationAddress.errors.isLocationBlank = vm.mode.isChangingLocation && !vm.locationSearch.location;
        }

    }
})();
