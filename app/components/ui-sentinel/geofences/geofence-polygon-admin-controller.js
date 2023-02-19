(function() {
    'use strict';

    angular
        .module('ui-sentinel.geofences')
        .controller('GeofencePolygonAdminController', GeofencePolygonAdminController);

    GeofencePolygonAdminController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'PolygonGeofencesService', 'SentinelUiSession', 'localStorageService', 'FeedbackService', 'MapsConstants', 'GeofencesDataService', 'RlsUiSession'];
    function GeofencePolygonAdminController($rootScope, $scope, $state, $stateParams, PolygonGeofencesService, SentinelUiSession, localStorageService, FeedbackService, MapsConstants, GeofencesDataService, RlsUiSession) {
       
        var vm = {
            map: null,
            mapType: MapsConstants.mapTypes.hybrid,
            mapTypes: MapsConstants.mapTypes,
            mapZooms: MapsConstants.zooms,
            mapShapeStyles: MapsConstants.shapes,
            drawingManager: null,
            geofence: null,
            polygon: null,
            locationLimit: 5,
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
            shapeText: {
                value: null,
                isPristine: true,
                errors: {
                    isBlank: true,
                    isNotValidPolygon: false
                },
                hasError: function() {
                    return this.errors.isBlank || this.errors.isNotValidPolygon;
                },
                validate: function() {
                    this.isPristine = false;
                    this.errors.isNotValidPolygon = false;
                    this.errors.isBlank = !this.value || !vm.polygon;

                    if (!this.errors.isBlank) {
                        this.errors.isNotValidPolygon = vm.polygon.getPath().length < 3;
                    }
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
                getLocations: getLocations,
                changeLocation: changeLocation,
                selectLocation: selectLocation,
                panToGeofence: panToGeofence,
                locationSearchChanged: locationSearchChanged,
                redraw: redraw
            }
        };
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
            setPermissions();
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($state.current.name === 'geofence.polygon' || $state.current.name === 'geofence.polygonNew') {
                    GeofencesDataService.load();
                    $state.go('geofences.list');
                }
            });

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

        function configureDrawingManager() {
            vm.drawingManager = new google.maps.drawing.DrawingManager({
                map: vm.map,
                drawingMode: google.maps.drawing.OverlayType.POLYGON,
                drawingControl: false,
                polygonOptions: {
                    fillColor: vm.mapShapeStyles.polygon.fillColor,
                    fillOpacity: vm.mapShapeStyles.polygon.fillOpacity,
                    strokeColor: vm.mapShapeStyles.polygon.strokeColor,
                    strokeOpacity: vm.mapShapeStyles.polygon.strokeOpacity,
                    strokeWeight: vm.mapShapeStyles.polygon.strokeWeight,
                    clickable: false,
                    editable: vm.hasPermission.toSave
                }
            });

            var polygonCompleteListener = google.maps.event.addListener(vm.drawingManager, 'polygoncomplete', function(polygon) {
                vm.drawingManager.setMap(null);
                vm.drawingManager = null;
                vm.polygon = polygon;
                setShapeText();
                google.maps.event.addListener(vm.polygon.getPath(), 'insert_at', setShapeText);
                google.maps.event.addListener(vm.polygon.getPath(), 'remove_at', setShapeText);
                google.maps.event.addListener(vm.polygon.getPath(), 'set_at', setShapeText);
                google.maps.event.removeListener(polygonCompleteListener);
                $scope.$apply();
                google.maps.event.trigger(vm.map, 'resize');
            });
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

            clearLocationMarker();

            if (vm.polygon) {
                vm.polygon.setMap(null);
                vm.polygon = null;
                vm.shapeText.value = null;
                vm.shapeText.isPristine = true;
            }

            if (vm.drawingManager) {
                vm.drawingManager.setMap(null);
                vm.drawingManager = null;
            }
        }

        function clearLocationMarker() {
            if (vm.geofenceAddress.locationMarker) {
                vm.geofenceAddress.locationMarker.setMap(null);
                vm.geofenceAddress.locationMarker = null;
            }
        }

        function close() {
            vm.geofence = null;
            $state.go($stateParams.referrer, $stateParams.referrerParams);            
        }

        function drawGeofence() {
            if (vm.polygon) {
                vm.polygon.setMap(null);
                vm.polygon = null;
            }

            vm.polygon = new google.maps.Polygon({
                paths: getPolygonCoordinates(vm.geofence),
                strokeColor: vm.mapShapeStyles.polygon.strokeColor,
                strokeOpacity: vm.mapShapeStyles.polygon.strokeOpacity,
                strokeWeight: vm.mapShapeStyles.polygon.strokeWeight,
                fillColor: vm.mapShapeStyles.polygon.fillColor,
                fillOpacity: vm.mapShapeStyles.polygon.fillOpacity,
                editable: vm.hasPermission.toSave
            });

            google.maps.event.addListener(vm.polygon.getPath(), 'insert_at', setShapeText);
            google.maps.event.addListener(vm.polygon.getPath(), 'remove_at', setShapeText);
            google.maps.event.addListener(vm.polygon.getPath(), 'set_at', setShapeText);

            // initMap(getPolygonCenter(vm.geofence));
            vm.polygon.setMap(vm.map);
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

        function getPolygonBounds(polygon) {
            var bounds = new google.maps.LatLngBounds();
            var paths = polygon.getPaths();
            var path;
            for (var i = 0; i < paths.length; i++) {
                path = polygon.getPaths().getAt(i);
                for (var j = 0; j < path.length; j++ ) {
                    bounds.extend(path.getAt(j));
                }
            }
            return bounds;
        }

        function getPolygonCenter(geofence) {
            var points = geofence.shapeText.replace('POLYGON ((','').replace('))','').split(', ');
            var bounds = new google.maps.LatLngBounds();
            var coord;
            _.forEach(points, function(point) {
                coord = point.trim().split(' ');
                bounds.extend(new google.maps.LatLng(Number(coord[1]), Number(coord[0])));
            });

            return bounds.getCenter();
        }

        function getPolygonCoordinates(geofence) {
            var coords = [];
            var coord;
            var points = geofence.shapeText.replace('POLYGON ((','').replace('))','').split(', ');
            _.forEach(points, function(point) {
                coord = point.trim().split(' ');
                coords.push(new google.maps.LatLng(Number(coord[1]), Number(coord[0])));
            });

            return coords;
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
            vm.map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('geofenceZoom'));
            vm.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('redrawTool'));
            vm.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('drawPolygonHelpTool'));

            vm.map.panToGeofence = panToGeofence;
        }

        function load() {
            $rootScope.loading = true;
            var promise = PolygonGeofencesService.getGeofence($stateParams.geofenceId).$promise;
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
            if (vm.polygon) {
                var bounds = getPolygonBounds(vm.polygon);
                vm.map.panTo(bounds.getCenter());
                vm.map.fitBounds(bounds);
                return;
            }

            if (vm.geofenceAddress.location) {
                vm.map.panTo(vm.geofenceAddress.location.geometry.location);
                vm.map.setZoom(10);
            }
        }

        function redraw() {
            if (vm.polygon) {
                vm.polygon.setMap(null);
                vm.polygon = null;
            }
            configureDrawingManager();
        }

        function remove() {
            vm.feedback.clear();
            $rootScope.loading = true;
            var promise = PolygonGeofencesService.removeGeofence(vm.geofence).$promise;
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

            if (vm.drawingManager) {
                vm.drawingManager.setMap(null);
                vm.drawingManager = null;
            }

            if (vm.polygon) {
                vm.polygon.setMap(null);
                vm.polygon = null;
            }
            
            if (!vm.mode.isNew) {
                $state.current.data.subTitle = vm.geofence.name;
                vm.geofenceName.value = vm.geofence.name;
                vm.locationSearch.value = vm.geofence.address;                
                vm.geofenceAddress.value = vm.geofence.address;
                vm.geofenceAddress.location = null;
                vm.geofenceDescription.value = vm.geofence.comments;
                vm.shapeText.value = vm.geofence.shapeText;
                drawGeofence();
                panToGeofence();
            }
            else {
                vm.geofenceName.value = null;
                vm.geofenceDescription.value = null;
                vm.locationSearch.value = null;
                vm.geofenceAddress.value = null;
                vm.geofenceAddress.location = null;
                vm.shapeText.value = null;
            }

            vm.geofenceName.isPristine = true;
            vm.geofenceName.errors.isBlank = true;
            vm.geofenceName.errors.isDuplicate = false;
            
            vm.geofenceAddress.isPristine = true;
            vm.geofenceAddress.errors.isBlank = true;

            vm.shapeText.isPristine = true;
            vm.shapeText.errors.isBlank = true;

            vm.locationSearch.locations = [];
            vm.locationSearch.isPristine = true;
            vm.locationSearch.errors.isBlank = true;
            vm.locationSearch.errors.hasZeroResults = false;

            clearLocationMarker();

        }

        function selectLocation(location) {
            vm.mode.isChangingLocation = false;
            vm.geofenceAddress.value = location.formatted_address;
            vm.geofenceAddress.location = location;
            vm.geofenceAddress.locationMarker = new google.maps.Marker({
                id: 1,
                position: {
                    lat: location.geometry.location.lat(),
                    lng: location.geometry.location.lng()
                },
                map: vm.map
            });

            panToGeofence();
            configureDrawingManager();
            validateLocation();
        }

        function setPermissions() {
            var user = localStorageService.get('isRlsRoute') ? RlsUiSession.user : SentinelUiSession.user;
            vm.hasPermission.toSave =
                user.isSystemAdmin ||
                user.isAccountAdmin ||
                user.isAccountEditor;
        }

        function setShapeText() {
            var shapeText = 'POLYGON ((';
            for (var i = 0; i < vm.polygon.getPath().length; i++) {
                var latLng = vm.polygon.getPath().getAt(i);
                shapeText += latLng.lng() + ' ' + latLng.lat() + ', ';
            }
            shapeText += vm.polygon.getPath().getAt(0).lng() + ' ' + vm.polygon.getPath().getAt(0).lat() + '))';
            vm.shapeText.value = shapeText;
        }

        function submit() {
            vm.feedback.clear();

            vm.geofenceName.validate();
            vm.geofenceAddress.validate();
            vm.shapeText.validate();
            vm.locationSearch.validate();

            if (vm.geofenceName.hasError() || vm.geofenceAddress.hasError() || vm.shapeText.hasError()) {
                return;
            }

            var focus = localStorageService.get('isRlsRoute') ? RlsUiSession.focus : SentinelUiSession.focus;

            var polygon = {
                name: vm.geofenceName.value,
                address: vm.geofenceAddress.value,
                type: 'polygon',
                entityType: 'PolygonGeofence',
                clientId: focus.id,
                comments: vm.geofenceDescription.value,
                shapeText: vm.shapeText.value
            };
            if (!vm.mode.isNew) {
                polygon.id = vm.geofence.id;
            }

            $rootScope.loading = true;

            var promise = vm.mode.isNew ?
                PolygonGeofencesService.addGeofence(focus, polygon).$promise :
                PolygonGeofencesService.updateGeofence(polygon).$promise;

            promise.then(
                function (result) {
                    $rootScope.loading = false;
                    vm.geofence = result;
                    var message = vm.geofence.name + ' has been ' + (vm.mode.isNew ? 'created' : 'updated');

                    GeofencesDataService.load();
                    if (vm.mode.isNew) {
                        $state.go('geofence.polygon', { geofenceId: result.id});
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
            vm.geofenceAddress.isPristine = false;
            vm.geofenceAddress.errors.isBlank = !vm.geofenceAddress.value;
            vm.geofenceAddress.errors.isLocationBlank = vm.mode.isChangingLocation && !vm.locationSearch.location;
        }

    }
})();