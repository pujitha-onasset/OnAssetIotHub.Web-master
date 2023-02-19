(function () {
    'use strict';

    angular
        .module('ui-sentinel.shipments')
        .factory('TemplateEditorService', TemplateEditorService);

    TemplateEditorService.$inject = ['ShipmentTemplatesService', 'SentinelUiSession', 'FeedbackService','SentryAccountApiService'];
    function TemplateEditorService (ShipmentTemplatesService, SentinelUiSession, FeedbackService,SentryAccountApiService) {
        var emailValidator = /^([\w+-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/i;
        var nextStopId = 0;
        var MIN_DURATION = 1;
        var MAX_DURATION = 45; 

        var service = {
            template: null,
            availableGeofences: [],
            shipmentDevice: null,
            feedback: FeedbackService,
            name: {
                value: null,
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank || this.errors.isDuplicate;
                },
                errors: {
                    isBlank: true,
                    isDuplicate: false
                },
                validate: validateName
            },
            duration: {
                min: MIN_DURATION,
                max: MAX_DURATION,
                value: null,
                isPristine: true,
                hasError: function () {
                    return this.errors.isOutOfRange;
                },
                errors: {
                    isOutOfRange: false
                },
                validate: validateDuration
            },
            trackDeviceReturn: {
                value: false,
                isPristine: true,
                hasError: function () {
                    return false;
                },
                errors: {},
                validate: function () {
                }
            },
            device: {
                value: null,
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
            sentinels: [],
            subscribers: [],
            shipmentEmails: {
                value: null,
                isPristine: true,
                hasError: function () {
                    return this.errors.invalidEmails.length > 0;
                },
                errors: {
                    invalidEmails: []
                },
                validate: validateSubscribers
            },
            stops: {
                origin: newEditorStop('blank'),
                other: [],
                destination: newEditorStop('blank'),
                hasError: stopsHaveError
            },
            isValid: false,
            addStop: addStop,
            removeStop: removeStop,
            save: save,
            createStops: createStops,
            stopToSave: stopToSave,
            edit: edit,
            create: create,
            reset: reset,
            clear: clear,
            //validate: validate,
            validateStops: validateStops
        };

        return service;

        function addStop(type) {
            var stop = newEditorStop(type === null ? 'blank' : type);
            stop.stopId = nextStopId++;
            service.stops.other.push(stop);
            return stop;
        }
        
        function clear() {
            service.template = null;
            service.availableGeofences = [];
            nextStopId = 0;
            init();
        }

        function create(availableGeofences) {
            service.template = null;
            service.availableGeofences = availableGeofences;
             loadDevice();
            reset();
        }

        function edit(template, availableGeofences) {
            console.log("Template",template);
            service.template = template;
            service.availableGeofences = availableGeofences;
            loadDevice();
            reset();
        }

        function loadDevice() {
            console.log("loadDevices",service.template);
            if(!service.template || !service.template.deviceTagId)
                return;
            var promise = SentryAccountApiService.getDevicesForASML(SentinelUiSession.focus,service.template.deviceTagId).$promise;

            promise.then(
                function(result) {
                    console.log(result);
                    service.shipmentDevice = result[0];
                    service.device.value = result[0];
                },
                function(error) {
                    console.log(error);
                    service.feedback.addError(error.data.message);
                }
            );
        }

        function validateDevice() {
            service.device.isPristine = false;
            service.device.errors.isNotFound = false;
            service.device.errors.isBlank = service.device.value === null;
            if (service.device.errors.isBlank) {
                return;
            }

            var promise = SentryAccountApiService.getDevicesForASML(SentinelUiSession.focus,service.device.value.imei).$promise;
            promise.then(
                function(result) {
                    //we expect this
                },
                function(error) {
                    service.device.errors.isNotFound = true;
                }
            );
        }

        function newEditorStop(type) {
            return {
                type: type,
                address: {
                    value: null,
                    isPristine: true,
                    isChanging: false,
                    hasError: function () {
                        return this.errors.isBlank;
                    },
                    errors: {
                        isBlank: true
                    },
                    validate: function () {
                        this.isPristine = false;
                        this.errors.isBlank = !this.value;
                    }
                },
                geofence: {
                    name: null,
                    value: null,
                    isPristine: true,
                    isChanging: false,
                    hasError: function () {
                        return this.errors.isBlank;
                    },
                    errors: {
                        isBlank: true
                    },
                    validate: function () {
                        this.isPristine = false;
                        this.errors.isBlank = !this.value;
                    }                    
                },
                locationSearch: {
                    value: null,
                    location: null,
                    availableLocations: [],
                    isPristine: true,
                    hasError: function () {
                        return this.errors.isBlank || this.errors.hasZeroResults || this.errors.isLocationMissing;
                    },
                    errors: {
                        isBlank: true,
                        isLocationMissing: false,
                        hasZeroResults: false
                    },
                    validate: function () {
                        this.isPristine = false;
                        this.errors.isBlank = !this.value;
                        this.errors.isLocationMissing = false;
                        this.errors.hasZeroResults = false;

                        if (!this.errors.isBlank) {
                            this.errors.isLocationMissing = !this.location;
                        }
                    }
                },
                validate: function () {
                    validateStop(this);
                },
                hasError: function() {
                    return (this.type === 'address' && this.address.hasError()) || (this.type === 'geofence' && this.geofence.hasError());
                }
            };
        }

        function editorStop(templateStop) {
            /*var stop = newEditorStop('blank');

            if (templateStop.geofenceId) {
                stop.type = 'geofence';
                stop.geofence.value = _.find(service.availableGeofences, { geofenceId: templateStop.geofenceId });
                stop.geofence.name = stop.geofence.value.name;
            }
            else {
                stop.type = 'address';
                stop.address.value = templateStop.address;
                stop.locationSearch.value = templateStop.address;
            }
            return stop;*/

            var stop = newEditorStop('blank');

            if (templateStop.address === templateStop.nameForAddress) {
                stop.type = 'address';
                stop.address.value = templateStop.address;
                stop.locationSearch.value = templateStop.address;
            }
            else {
                stop.type = 'geofence';
                stop.geofence.name = templateStop.nameForAddress;
                stop.geofence.value = _.find(service.availableGeofences, { name: templateStop.nameForAddress });
            }
            stop.destinationId = templateStop.destinationId;

            return stop;
        }

        function init() {
            service.name.value = null;
            service.name.isPristine = true;
            service.name.errors.isBlank = true;
            service.name.isDuplicate = false;
            service.duration.value = null;
            service.duration.isPristine = true;
            service.duration.errors.isOutOfRange = false;
            service.trackDeviceReturn.value = false;
            service.trackDeviceReturn.isPristine = true;
            service.subscribers = [];
            service.shipmentEmails.value = null;
            service.shipmentEmails.isPristine = true;
            service.shipmentEmails.errors.invalidEmails = [];
            service.stops.origin = newEditorStop('blank');
            service.stops.other = [];
            service.stops.destination = newEditorStop('blank');
            service.device.value = null;
            service.device.isPristine = true;
            service.device.errors.isBlank = true;
            service.device.errors.isNotFound = false;
            service.sentinels = [];
        }

        function reset() {
            init();

            if (service.template === null) {
                return;
            }

            service.name.value = service.template.name;
            service.duration.value = service.template.defaultTrackingTimeSpanInDays;
            service.trackDeviceReturn.value = service.template.trackReverseLogistics;
            service.subscribers =  service.template.subscribers !== null ? service.template.subscribers : [];
            service.shipmentEmails.value =  service.template.shipmentEmails !== null ? joinEmails(service.template.shipmentEmails): null;
            service.device.value = null;
            service.device.isPristine = true;
            service.device.errors.isBlank = true;
            service.device.errors.isNotFound = false;
            service.sentinels = [];
            service.sentinels = service.template.sentinels;

            _.forEach(service.template.stops, function(templateStop) {
                /*if (templateStop.stopType.toLowerCase() === 'origin') {
                    service.stops.origin = editorStop(templateStop);
                    return;
                }
                if (templateStop.stopType.toLowerCase() === 'destination') {
                        service.stops.destination = editorStop(templateStop);
                    return;
                }*/

                var otherStop = editorStop(templateStop);
                otherStop.stopId = nextStopId++;
                service.stops.other.push(otherStop);
            });
        }

        function joinEmails(emailsArray){
            console.log("joinEmails",emailsArray);
            if(emailsArray.length==0)
                return "";
            var emails = "";
            emailsArray.forEach(item => emails += item.email + ",");
            console.log("emaiils",emails);
            return emails.substring(0,emails.length-1);
        }

        function buildArrayEmails(emailsArraySource){
            if(!emailsArraySource)
                return [];
            var emails = [];
            emailsArraySource.forEach(item => emails.push({"email":item}));
            return emails;
        }

        function removeStop(stopId) {
            var stops = [];
            _.forEach(service.stops.other, function (stop) {
                if (stop.stopId !== stopId) {
                    stops.push(stop);
                }
            });
            service.stops.other = stops;
        }

        function createStops(template){
            var stops = [];
            _.forEach(service.stops.other, function (stop) {
                stops.push(stopToSave('Stop',stop));
            });

            if(stops.length==0)
                return null;

            console.log("Stops",stops);

            return ShipmentTemplatesService.addStops(SentinelUiSession.focus, template.id, stops).$promise;
        }

        function save() {
            service.feedback.clear();
            validateName();
            validateDuration();
            validateStops();
            validateSubscribers();
            validateDevice();

            if (service.name.hasError() || service.duration.hasError() || service.stops.hasError() || service.shipmentEmails.hasError() ) {
                return null;
            }

            var templateToSave = {
                name: service.name.value,
                defaultTrackingTimeSpanInDays: service.duration.value,
                trackReverseLogistics: service.trackDeviceReturn.value,
                subscribers: service.subscribers, // ? service.subscribers.value.replace(/\s/g,'').split(";").join(",").split(',') : null,
                shipmentEmails: service.shipmentEmails.value ? buildArrayEmails(service.shipmentEmails.value.replace(/\s/g,'').split(";").join(",").split(',')) : [],
                // deviceTagId: service.device.value.imei,
                sentinels: [],
                stops: []
            };
            /*if (service.stops.origin.type !== 'blank') {
                templateToSave.stops.push(stopToSave('Origin', service.stops.origin));
            }
            _.forEach(service.stops.other, function (stop) {
                templateToSave.stops.push(stopToSave('Stop', stop));
            });
            if (service.stops.destination.type !== 'blank') {
                templateToSave.stops.push(stopToSave('Destination', service.stops.destination));
            }*/ 

             _.forEach(service.sentinels,function(s){
                templateToSave.sentinels.push({
                    "sentinelId":s.sentinelId,
                    "deviceId":s.deviceId
                });
            });           

            if (service.template === null) {
                templateToSave.id = 0;
                templateToSave.clientGuid = SentinelUiSession.focus.id;
            }
            else {
                templateToSave.id = service.template.id;
                templateToSave.clientGuid = service.template.clientGuid;
            }

            console.log(templateToSave);

            return templateToSave.id  === 0 ?
                ShipmentTemplatesService.createTemplate(SentinelUiSession.focus, templateToSave).$promise :
                ShipmentTemplatesService.updateTemplate(templateToSave).$promise;
        }

        function stopsHaveError() {

            var otherError = false;
            _.forEach(service.stops.other, function(stop) {
                stop.validate();
                otherError = stop.hasError() || otherError;
            });
            return /*service.stops.origin.hasError() || service.stops.destination.hasError() ||*/ otherError;
        }

        function stopToSave(stopType, editorStop) {
            var shipmentStop = {
                destinationId:0,
                nameForAddress: null,
                address: null,
                addressLongitude: null,
                addressLatitude: null,
                shipmentStopPolygonGeofence: null,
                shipmentStopRadialGeofence: null,
                hasArrived:false
            };
            if (editorStop.type === 'address') {
                shipmentStop.nameForAddress = editorStop.address.value;
                shipmentStop.address = editorStop.address.value;
                shipmentStop.addressLongitude = editorStop.locationSearch.location.geometry.location.lng();
                shipmentStop.addressLatitude = editorStop.locationSearch.location.geometry.location.lat();
                shipmentStop.shipmentStopRadialGeofence = {
                    longitudeCenter: editorStop.locationSearch.location.geometry.location.lng(),
                    latitudeCenter: editorStop.locationSearch.location.geometry.location.lat(),
                    radiusUnitType: 'miles',
                    radius: 2.0
                };
            }
            else {
                shipmentStop.nameForAddress = editorStop.geofence.value.name;
                shipmentStop.address = editorStop.geofence.value.address;

                if (editorStop.geofence.value.type === 'polygon') {
                    var coords = editorStop.geofence.value.shapeText.replace('POLYGON ((', '').replace('))', '').split(', ');
                    var latLngBounds = new google.maps.LatLngBounds();
                    _.forEach(coords, function(coord) {
                        var point = coord.split(' ');
                        var latLng = new google.maps.LatLng(Number(point[1]), Number(point[0]));
                        latLngBounds.extend(latLng);
                    });
                    var center = latLngBounds.getCenter();

                    shipmentStop.addressLongitude = center.lng();
                    shipmentStop.addressLatitude = center.lat();
                    shipmentStop.shipmentStopPolygonGeofence = {
                        shapeText: editorStop.geofence.value.shapeText
                    };
                }
                else {
                    shipmentStop.addressLongitude = editorStop.geofence.value.longitudeCenter;
                    shipmentStop.addressLatitude = editorStop.geofence.value.latitudeCenter;
                    shipmentStop.shipmentStopRadialGeofence = {
                        longitudeCenter: editorStop.geofence.value.longitudeCenter,
                        latitudeCenter: editorStop.geofence.value.latitudeCenter,
                        radiusUnitType: editorStop.geofence.value.radiusUnitType,
                        radius: editorStop.geofence.value.radius
                    };
                }
            }
            
            if (editorStop.destinationId) {
                shipmentStop.destinationId = editorStop.destinationId;
            }

            return shipmentStop;
            /*return {
                stopType: stopType,
                geofenceId: editorStop.type === 'geofence' ? editorStop.geofence.value.id : null,
                name: editorStop.type === 'geofence' ? editorStop.geofence.value.name : editorStop.address.value,
                address: editorStop.type === 'address' ? editorStop.address.value : null,
                useNameFromGeofence: editorStop.type === 'geofence',
                useAddressFromGeofence: editorStop.type === 'geofence',
                contactName: null,
                contactPhone: null
            };*/
        }        

        // function validate() {
        //     service.isValid = true;
        //     validateName();
        //     validateDuration();
        //     validateStops();
        //     validateSubscribers();
        //
        //     service.isValid = !(service.name.hasError() ||
        //         service.duration.hasError() ||
        //         service.stops.hasError() ||
        //         service.subscribers.hasError());
        //
        // }

        function validateName() {
            service.name.isPristine = false;
            service.name.errors.isBlank = !service.name.value || service.name.value === '';
            service.name.errors.isDuplicate = false;
        }

        function validateDuration() {
            service.duration.isPristine = false;
            service.duration.errors.isOutOfRange = service.duration.value !== null ? service.duration.value < MIN_DURATION || service.duration.value > MAX_DURATION : false;
        }
        
        function validateStops() {
            //validateStop(service.stops.origin);
            _.forEach(service.stops.other, function (stop) {
                validateStop(stop);
            });
            //validateStop(service.stops.destination);            
        }

        function validateStop(stop) {
            if (stop.type === 'address') {
                stop.address.validate();
                stop.locationSearch.validate();
            }

            if (stop.type === 'geofence') {
                stop.geofence.validate();
            }
        }

        function validateSubscribers() {
            service.shipmentEmails.isPristine = false;
            service.shipmentEmails.isValid = true;
            service.shipmentEmails.errors.invalidEmails = [];

            if (service.shipmentEmails.value === null || service.shipmentEmails.value.trim() === '') {
                return;
            }

            var emails = service.shipmentEmails.value.replace(/\s/g, '').split(";").join(",").split(',');
            _.forEach(emails, function(email) {
                if (email !== null && email.trim() !== '') {
                    var isEmail = emailValidator.test(email.trim());
                    if (!isEmail) {
                        service.shipmentEmails.errors.invalidEmails.push(email.trim());
                    }
                }
            });
        }
    }


})();