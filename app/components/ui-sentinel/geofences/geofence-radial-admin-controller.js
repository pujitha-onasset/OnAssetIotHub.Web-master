(function() {
    'use strict';

    angular
        .module('ui-sentinel.geofences')
        .controller('GeofenceRadialAdminController', GeofenceRadialAdminController);

    GeofenceRadialAdminController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'RadialGeofencesService', 'SentinelUiSession', 'localStorageService', 'FeedbackService', 'MapsConstants', 'GeofencesDataService', 'RlsUiSession'];
    function GeofenceRadialAdminController($rootScope, $scope, $state, $stateParams, RadialGeofencesService, SentinelUiSession, localStorageService, FeedbackService, MapsConstants, GeofencesDataService, RlsUiSession) {
        var DEFAULT_UNIT_TYPE = 'miles';

        var MAX_RADIUS = {
            miles: 2048,
            feet: 5280,
            meters: 1000,
            kilometers: 3295
        };

        var MIN_RADIUS = {
            miles: 1,
            feet: 164,
            meters: 50,
            kilometers: 1
        };


        var vm = {
            map: null,
            mapType: MapsConstants.mapTypes.hybrid,
            mapTypes: MapsConstants.mapTypes,
            mapZooms: MapsConstants.zooms,
            mapShapeStyles: MapsConstants.shapes,
            geofence: null,
            centerLatLng: null,
            circle: null,
            locationLimit: 5,
            latitudeCenter: null,
            longitudeCenter: null,
            geofenceName: {
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
            geofenceDescription: {
                value: null
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
            geofenceAddress: {
                value: null,
                location: null,
                hasLocation: function() {
                  return vm.geofence || this.location;
                },
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
            radiusMax: MAX_RADIUS[DEFAULT_UNIT_TYPE],
            radiusMin: MIN_RADIUS[DEFAULT_UNIT_TYPE],
            radius: {
                value: convertFromMeters(MIN_RADIUS[DEFAULT_UNIT_TYPE], DEFAULT_UNIT_TYPE),
                isPristine: true,
                errors: {
                    isBlank: true,
                    isInvalid: true
                },
                hasError: function() {
                    return this.errors.isBlank || this.errors.isInvalid;
                },
                validate: validateRadius
            },
            radiusUnitType: {
                value: DEFAULT_UNIT_TYPE,
                isPristine: true,
                errors: {
                    isBlank: true
                },
                hasError: function() {
                    return this.errors.isBlank;
                },
                validate: function() {
                    this.isPristine = false;
                    this.errors.isBlank = !this.value;
                }
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
                changeRadiusUnitType: changeRadiusUnitType,
                getLocations: getLocations,
                changeLocation: changeLocation,
                selectLocation: selectLocation,
                panToGeofence: panToGeofence,
                locationSearchChanged: locationSearchChanged
            }
        };
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
            setPermissions();

            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($state.current.name === 'geofence.radial' || $state.current.name === 'geofence.radialNew') {
                    GeofencesDataService.load();
                    $state.go('geofences.list');
                }
            });

            var distanceUnitType = localStorageService.get('distanceUnitType');

            if (distanceUnitType)
                vm.radiusUnitType.value = distanceUnitType;

            $scope.$watch(
                function() {
                    return vm.radius.value;
                },
                function (value) {
                    updateCircle();
                }, true
            );

            initMap();

            if ($stateParams.geofenceId) {
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
            vm.geofenceAddress.location = null;            
            vm.locationSearch.isPristine = true;
            vm.locationSearch.errors.isBlank = true;
            vm.locationSearch.errors.hasZeroResults = false;
            vm.locationSearch.locations = [];

            if (!vm.locationSearch.value) {
                vm.locationSearch.value = vm.geofence ? vm.geofence.address : null;
            }

            if (vm.circle) {
                vm.circle.setMap(null);
                vm.circle = null;
            }
        }

        function changeRadiusUnitType(unit) {
            vm.radiusUnitType.value = unit;
            vm.radiusMax = MAX_RADIUS[vm.radiusUnitType.value];
            vm.radiusMin = MIN_RADIUS[vm.radiusUnitType.value];
            updateCircle();
        }

        function close() {
            vm.geofence = null;
            $state.go($stateParams.referrer, $stateParams.referrerParams);
        }

        function convertFromMeters(meters, unitType) {
            switch (unitType) {
                case 'meters':
                    return meters;
                case 'kilometers':
                    return Math.round(meters / 1000 * 100) / 100;
                case 'miles':
                    return Math.round(meters / 1609.34 * 100) / 100;
                case 'feet':
                    return Math.round(meters / 0.3048 * 100) / 100;
                default:
                    return 0;
            }
        }

        function convertToMeters(value, unitType) {
            switch (unitType) {
                case 'meters':
                    return value;
                case 'kilometers':
                    return Math.round(value * 1000);
                case 'miles':
                    return Math.round(value * 1609.34);
                case 'feet':
                    return Math.round(value * 0.3048);
                default:
                    return 0;
            }
        }

        function drawGeofence() {

            if (vm.circle) {
                vm.circle.setMap(null);
                vm.circle = null;
            }

            if (!vm.centerLatLng) {
                return;
            }

            vm.radius.validate();
            if (vm.radius.hasError()) {
                return;
            }

            vm.circle = new google.maps.Circle({
                center: vm.centerLatLng,
                radius: convertToMeters(vm.radius.value, vm.radiusUnitType.value),
                strokeColor: vm.mapShapeStyles.radial.strokeColor,
                strokeOpacity: vm.mapShapeStyles.radial.strokeOpacity,
                strokeWeight: vm.mapShapeStyles.radial.strokeWeight,
                fillColor: vm.mapShapeStyles.radial.fillColor,
                fillOpacity: vm.mapShapeStyles.radial.fillOpacity,
                editable: vm.hasPermission.toSave
            });
            google.maps.event.addListener(vm.circle, 'center_changed', function() {
                vm.centerLatLng = vm.circle.getCenter();
            });
            google.maps.event.addListener(vm.circle, 'radius_changed', function() {
                var vmRadiusValue = convertToMeters(vm.radius.value, vm.radiusUnitType.value);
                var circleRadiusValue = vm.circle.getRadius();

                //if the two aren't equal, then the event originated from a drag operation on the circle and the UI needs to be updated accordingly
                if (vmRadiusValue !== circleRadiusValue) {
                    vm.radius.value = convertFromMeters(circleRadiusValue, vm.radiusUnitType.value);
                    $scope.$apply();
                }
            });
            vm.circle.setMap(vm.map);
            panToGeofence();
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
            vm.map = new google.maps.Map(document.getElementById('geofenceMap'), {
                zoom: vm.mapZooms.geofenceDefault.zoomLevel,
                center: vm.mapZooms.geofenceDefault.center,
                mapTypeId: vm.mapType.type,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.TERRAIN]
                }
            });

            vm.map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('centerZoomLabel'));
            vm.map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('centerZoomLabel'));
            vm.map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('geofenceZoom'));

            vm.map.panToGeofence = panToGeofence;
        }

        function load() {
            $rootScope.loading = true;
            var promise = RadialGeofencesService.getGeofence($stateParams.geofenceId).$promise;
            promise.then(
                function(result) {
                    vm.geofence = result;
                    reset();
                },
                function (error) {
                    if (error.status !== 404) {
                        vm.feedback.addError(error);
                    }
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }
        
        function locationSearchChanged() {
            vm.geofenceAddress.isPristine = true;
            vm.locationSearch.isPristine = true;
        }

        function panToGeofence() {
            if (vm.circle) {
                vm.map.panTo(vm.circle.getCenter());
                vm.map.fitBounds(vm.circle.getBounds());
            }
        }

        function remove() {
            vm.feedback.clear();
            $rootScope.loading = true;
            var promise = RadialGeofencesService.removeGeofence(vm.geofence).$promise;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.mode.isRemoving = false;
                    GeofencesDataService.load();
                    $state.go('geofences.list');
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function reset() {
            vm.mode.isChangingLocation = vm.mode.isNew;

            if (vm.circle) {
                vm.circle.setMap(null);
                vm.circle = null;
            }

            if (!vm.mode.isNew) {
                $state.current.data.subTitle = vm.geofence.name;
                vm.geofenceName.value = vm.geofence.name;
                vm.locationSearch.value = vm.geofence.address;
                vm.geofenceAddress.value = vm.geofence.address;
                vm.geofenceDescription.value = vm.geofence.comments;
                vm.radiusUnitType.value = vm.geofence.radiusUnitType;
                vm.radiusMax = MAX_RADIUS[vm.radiusUnitType.value];
                vm.radiusMin = MIN_RADIUS[vm.radiusUnitType.value];
                vm.radius.value =  vm.geofence.radius;
                vm.centerLatLng = new google.maps.LatLng(vm.geofence.latitudeCenter, vm.geofence.longitudeCenter);
                drawGeofence();
                panToGeofence();
            }
            else {
                vm.geofenceName.value = null;
                vm.geofenceDescription.value = null;
                vm.radiusUnitType.value = localStorageService.get('distanceUnitType') || DEFAULT_UNIT_TYPE;
                vm.radius.value = MIN_RADIUS[vm.radiusUnitType.value];
                vm.radiusMax = MAX_RADIUS[vm.radiusUnitType.value];
                vm.radiusMin = MIN_RADIUS[vm.radiusUnitType.value];
                vm.locationSearch.value = null;
                vm.geofenceAddress.value = null;
                vm.centerLatLng = null;
            }

            vm.geofenceName.isPristine = true;
            vm.geofenceName.errors.isBlank = true;
            vm.geofenceName.errors.isDuplicate = false;
            
            vm.radiusUnitType.isPristine = true;
            vm.radiusUnitType.isBlank = false;
            
            vm.radius.isPristine = true;
            vm.radius.errors.isBlank = false;

            vm.geofenceAddress.isPristine = true;
            vm.geofenceAddress.errors.isBlank = true;

            vm.locationSearch.locations = [];
            vm.locationSearch.isPristine = true;
            vm.locationSearch.errors.isBlank = true;
            vm.locationSearch.errors.hasZeroResults = false;

        }

        function selectLocation(location) {
            vm.mode.isChangingLocation = false;
            vm.geofenceAddress.value = location.formatted_address;
            vm.geofenceAddress.location = location;
            vm.centerLatLng = new google.maps.LatLng(
                location.geometry.location.lat(),
                location.geometry.location.lng());
            drawGeofence();
            panToGeofence();
            validateLocation();
        }

        function setPermissions() {
            var user = localStorageService.get('isRlsRoute') ? RlsUiSession.user : SentinelUiSession.user;
            vm.hasPermission.toSave =
                user.isSystemAdmin ||
                user.isAccountAdmin ||
                user.isAccountEditor;
        }

        function submit() {
            vm.feedback.clear();

            vm.geofenceName.validate();
            vm.radius.validate();
            vm.geofenceAddress.validate();
            vm.locationSearch.validate();
            
            if (vm.geofenceName.hasError() || vm.radius.hasError() || vm.geofenceAddress.hasError()) {
                return;
            }

            localStorageService.set('distanceUnitType', vm.radiusUnitType.value);

            var focus = localStorageService.get('isRlsRoute') ? RlsUiSession.focus : SentinelUiSession.focus;

            var radial = {
                name: vm.geofenceName.value,
                address: vm.geofenceAddress.value,
                type: 'radius',
                entityType: 'RadialGeofence',
                clientId: focus.id,
                comments: vm.geofenceDescription.value,
                radius: vm.radius.value,
                radiusUnitType: vm.radiusUnitType.value,
                latitudeCenter: vm.centerLatLng.lat(),
                longitudeCenter: vm.centerLatLng.lng()
            };
            if (!vm.mode.isNew) {
                radial.id = vm.geofence.id;
            }

            var radialPromise = vm.mode.isNew ?
                RadialGeofencesService.addGeofence(focus, radial).$promise :
                RadialGeofencesService.updateGeofence(radial).$promise;

                $rootScope.loading = true;
            radialPromise.then(
                function (result) {
                    $rootScope.loading = false;
                    vm.geofence = result;
                    var message = vm.geofence.name + ' has been ' + (vm.mode.isNew ? 'created' : 'updated');

                    GeofencesDataService.load();
                    if (vm.mode.isNew) {
                        $state.go('geofence.radial', { geofenceId: result.id});
                        vm.feedback.addSuccess(message);
                        return;
                    }
                    reset();

                    vm.feedback.addSuccess(message);
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

                    vm.feedback.addError(error);
                    //todo: handle errors
                }
            );
        }

        function updateCircle() {

            vm.radius.validate();

            if (!vm.radius.hasError() && !vm.circle && vm.centerLatLng) {
                drawGeofence();
                return;
            }

            if (!vm.radius.hasError() && vm.circle) {
                vm.circle.setVisible(true);
                vm.circle.setRadius(convertToMeters(vm.radius.value, vm.radiusUnitType.value));
                return;
            }

            if (vm.radius.hasError() && vm.circle) {
                vm.circle.setVisible(false);
            }
        }

        function validateLocation() {
            vm.geofenceAddress.isPristine = false;
            vm.geofenceAddress.errors.isBlank = !vm.geofenceAddress.value;
            vm.geofenceAddress.errors.isLocationBlank = !vm.centerLatLng;
        }

        function validateRadius() {
            vm.radius.isPristine = false;
            vm.radius.errors.isBlank = typeof vm.radius.value === 'undefined' || vm.radius.value === null || Number.isNaN(vm.radius.value);

            if (vm.radius.errors.isBlank) {
                return;
            }

            vm.radius.errors.isInvalid = vm.radius.value < 0 || vm.radius.value > MAX_RADIUS[vm.radiusUnitType.value] || vm.radius.value < MIN_RADIUS[vm.radiusUnitType.value];
        }

    }
})();