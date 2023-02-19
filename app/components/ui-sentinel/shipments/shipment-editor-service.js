(function () {
    'use strict';

    angular
        .module('ui-sentinel.shipments')
        .factory('ShipmentEditorService', ShipmentEditorService);

    ShipmentEditorService.$inject = ['$rootScope', 'ShipmentsService', 'SentinelUiSession', 'FeedbackService', 'DevicesService', 'RadialGeofencesService', 'PolygonGeofencesService', 'DatetimeValidatorService','SentryAdminApiService', 'SentryAccountApiService'];
    function ShipmentEditorService ($rootScope, ShipmentsService, SentinelUiSession, FeedbackService, DevicesService, RadialGeofencesService, PolygonGeofencesService, DatetimeValidatorService, SentryAdminApiService, SentryAccountApiService) {
        var emailValidator = /^([\w+-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/i;
        var nextStopId = 0; 

        var service = {
            feedback: FeedbackService,
            availableGeofences: null,
            beginTrackingStrategyTypeOld: null,
            shipment: null,
            shipmentDevice: null,
            referencePrefix: null,
            loadGeofences: loadGeofences,
            referenceNumber: {
                value: null,
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank || this.errors.isDuplicate || this.errors.isWrongPrefix || this.errors.isTooLong || this.errors.hasInvalidCharacters;
                },
                errors: {
                    isBlank: true,
                    isDuplicate: false,
                    isWrongPrefix: false,
                    isTooLong: false,
                    hasInvalidCharacters: false
                },
                validate: validateReferenceNumber
            },
            endDate: {
                date: moment().add(1, 'day').format('L'),
                time: moment().format('LT'),
                value: moment().add(1, 'day').toDate(),
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank || this.errors.isBeforeNow || this.errors.isNotADate || this.errors.isTimeBlank || this.errors.isNotATime;
                },
                errors: {
                    isBlank: true,
                    isBeforeNow: false,
                    isNotADate: false,
                    isNotATime: false,
                    isTimeBlank: false
                },
                validate: validateEndDate
            },
            beginDate: {
                date: moment().format('L'),
                time: moment().format('LT'),
                value: moment().toDate(),
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank || this.errors.isBeforeNow || this.errors.isNotADate || this.errors.isTimeBlank || this.errors.isNotATime;
                },
                errors: {
                    isBlank: true,
                    isBeforeNow: false,
                    isNotADate: false,
                    isNotATime: false,
                    isTimeBlank: false
                },
                validate: validateBeginDate
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
            beginGeofence: {
                value: null,
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank;
                },
                errors: {
                    isBlank: true,
                    isNotFound: false
                },
                validate: validateBeginGeofence
            },
            endGeofence: {
                value: null,
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank;
                },
                errors: {
                    isBlank: true,
                    isNotFound: false
                },
                validate: validateEndGeofence
            },
            endGeofence2: {
                value: null,
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank;
                },
                errors: {
                    isBlank: true,
                    isNotFound: false
                },
                validate: validateEndGeofence2
            },
            sentinels: [],
            notes: {
                value: null
            },
            beginTrackingStrategyType: {
                value:'date/time',
                isPristine: true,
                hasError: function() {
                    return false;
                },
                errors:{},
                validate: function() {

                }
            },
            endTrackingStrategyType: {
                value:'date/time',
                isPristine: true,
                hasError: function() {
                    return false;
                },
                errors:{
                    isBlank: true
                },
                validate: function() {
                    this.isPristine = false;
                    this.errors.isDuplicate = false;
                    this.errors.isBlank = !this.value;
                }
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
            isValidInfo: false,
            init: init,
            addStop: addStop,
            removeStop: removeStop,
            buildArrayEmails: buildArrayEmails,
            joinEmails: joinEmails,
            saveNew: saveNew,
            saveNewStops: saveNewStops,
            preSaveShipmentInfo: preSaveShipmentInfo,
            saveShipmentInfo: saveShipmentInfo,
            newEditorStop: newEditorStop,
            editorStop: editorStop,
            stopToSave: stopToSave,
            edit: edit,
            create: create,
            reset: reset,
            clear: clear,
            validate: validate,
            validateStops: validateStops,
            canEdit: true,
            completeShipment: completeShipment

        };
        return service;

        function addStop(type) {

            if (!service.canEdit) {
                service.feedback.addError('Shipment can not be changed');
                return null;
            }

            var stop = newEditorStop(type === null ? 'blank' : type);
            stop.stopId = nextStopId++;
            service.stops.other.push(stop);
            console.log("addStop",stop);
            return stop;
        }

        function clear() {
            service.shipment = null;
            service.shipmentDevice = null;
            service.availableGeofences = [];
        }

        function create() {
            clear();
            reset();
        }

        function edit(shipment) {
            clear();
            service.shipment = shipment;
            service.beginTrackingStrategyTypeOld = shipment.shipmentInfo.beginTrackingStrategyType;

            console.log("service.beginTrackingStrategyType",service.beginTrackingStrategyTypeOld);

            service.canEdit = shipment.shipmentInfo.status.toLowerCase() !== 'cancelled' && shipment.shipmentInfo.status.toLowerCase() !== 'completed';
            loadDevice();
            reset();
            //loadGeofences();  //todo: should use a service so that it does not have to reload these from API
        }

        function editorStop(shipmentStop) {
            var stop = newEditorStop('blank');

            if (shipmentStop.address === shipmentStop.nameForAddress) {
                stop.type = 'address';
                stop.address.value = shipmentStop.address;
                stop.locationSearch.value = shipmentStop.address;
            }
            else {
                stop.type = 'geofence';
                stop.geofence.name = shipmentStop.nameForAddress;
                stop.geofence.value = _.find(service.availableGeofences, { name: shipmentStop.nameForAddress });
            }
            stop.destinationId = shipmentStop.destinationId;

            return stop;
        }

        function init() {
            clear();
            reset();
            loadGeofences();  //todo: should use a service so that it does not have to reload these from API
        }

        function loadDevice() {
            var promise = SentryAccountApiService.getDevicesForASML(SentinelUiSession.focus,service.shipment.shipmentInfo.deviceTagId).$promise;

            promise.then(
                function(result) {
                    service.shipmentDevice = result[0];
                    service.device.value = result[0];
                },
                function(error) {
                    console.log(error);
                    service.feedback.addError(error.data.message);
                }
            );
        }

        function loadGeofence(geofenceId, type) {
            var radialPromise = RadialGeofencesService.getGeofence(geofenceId).$promise;
            radialPromise.then(
                function(result) {
                    if (typeof type !== undefined) {
                        if (type == "begin") {
                            if(service.beginTrackingStrategyType.value === "ArrivalGeofence"){
                                service.endGeofence.value = result;
                            } else if(service.beginTrackingStrategyType.value === "DepartureGeofence"){
                                service.beginGeofence.value = result;
                            }
                        } else if (type == "end") {
                            service.endGeofence2.value = result;
                        }
                    }
                },
                function(error) {
                    if (error.status !== 404) {
                        console.log(error);
                        vm.feedback.addError(error.data.message);
                    }
                }
            );

            var polygonPromise = PolygonGeofencesService.getGeofence(geofenceId).$promise;
            polygonPromise.then(
                function(result) {
                    if (typeof type !== undefined) {
                        if (type == "begin") {
                            if(service.beginTrackingStrategyType.value === "ArrivalGeofence"){
                                service.endGeofence.value = result;
                            } else if(service.beginTrackingStrategyType.value === "DepartureGeofence"){
                                service.beginGeofence.value = result;
                            }
                        } else if (type == "end") {
                            service.endGeofence2.value = result;
                        }
                    }
                },
                function(error) {
                    if (error.status !== 404) {
                        console.log(error);
                        vm.feedback.addError(error.data.message);
                    }
                }
            );
        }

        function loadGeofences() {
            console.log("loadGeofences.....");
            service.availableGeofences = [];
            service.stops.origin.geofence.name = null;
            service.stops.origin.geofence.value = null;
            service.stops.destination.geofence.name = null;
            service.stops.destination.geofence.value = null;
            _.forEach(service.stops.other, function(stop) {
                stop.geofence.name = null;
                stop.geofence.value = null;
            });

            var radialPromise = RadialGeofencesService.getGeofences(SentinelUiSession.focus).$promise;
            radialPromise.then(
                function(result) {
                    //console.log("Geofences", result);
                    service.availableGeofences = service.availableGeofences.concat(result);
                    console.log(service.availableGeofences);
                },
                function(error) {
                    service.feedback.addError(error.data.message);
                }
            );

            var polygonPromise = PolygonGeofencesService.getGeofences(SentinelUiSession.focus).$promise;
            polygonPromise.then(
                function(result) {
                    //console.log("Geofences", result);
                    service.availableGeofences = service.availableGeofences.concat(result);
                },
                function(error) {
                    service.feedback.addError(error.data.message);
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

        function removeStop(stopId) {

            if (!service.canEdit) {
                service.feedback.addError('Shipment can not be changed');
                return null;
            }

            var stops = [];
            _.forEach(service.stops.other, function (stop) {
                if (stop.stopId !== stopId) {
                    stops.push(stop);
                }
            });
            service.stops.other = stops;
        }

        function reset() {
            nextStopId = 0;

            //problem if the trackingConfig has not finished loading
            service.referencePrefix = SentinelUiSession.focus.trackingConfig && SentinelUiSession.focus.trackingConfig.referencePrefix ? SentinelUiSession.focus.trackingConfig.referencePrefix : null;
            service.referenceNumber.value = null;
            service.referenceNumber.isPristine = true;
            service.referenceNumber.errors.isBlank = true;
            service.referenceNumber.isDuplicate = false;
            service.referenceNumber.isWrongPrefix = false;
            service.endDate.date = moment().add(1, 'day').format('L');
            service.endDate.time = moment().format('LT');
            service.endDate.isPristine = true;
            service.endDate.errors.isBeforeNow = false;
            service.endDate.errors.isBlank = false;
            service.endDate.errors.isNotADate = false;
            service.endDate.errors.isNotATime = false;
            service.endDate.errors.isTimeBlank = false;
            service.beginDate.date = moment().format('L');
            service.beginDate.time = moment().format('LT');
            service.beginDate.isPristine = true;
            service.beginDate.errors.isBeforeNow = false;
            service.beginDate.errors.isBlank = false;
            service.beginDate.errors.isNotADate = false;
            service.beginDate.errors.isNotATime = false;
            service.beginDate.errors.isTimeBlank = false;
            service.device.value = null;
            service.device.isPristine = true;
            service.device.errors.isBlank = true;
            service.device.errors.isNotFound = false;
            service.sentinels = [];
            service.trackDeviceReturn.value = false;
            //service.trackDeviceReturn.isPristine = true;
            service.subscribers = [];
            service.shipmentEmails.value = null;
            service.shipmentEmails.isPristine = true;
            service.shipmentEmails.errors.invalidEmails = [];
            service.stops.origin = newEditorStop('address');
            service.stops.other = [];
            service.stops.destination = newEditorStop('address');
            service.notes.value = null;
            service.canEdit = true;

            if (service.shipment === null) {
                return;
            }

            service.referenceNumber.value = SentinelUiSession.focus.trackingConfig && SentinelUiSession.focus.trackingConfig.referencePrefix ?
                service.shipment.shipmentInfo.referenceNumber.replace(SentinelUiSession.focus.trackingConfig.referencePrefix, '') :
                service.shipment.shipmentInfo.referenceNumber;
            service.device.value = service.shipmentDevice;

            var beginDateMoment = moment(service.shipment.shipmentInfo.startDate).local();
            service.beginDate.value = beginDateMoment.toDate();
            service.beginDate.date = beginDateMoment.format('L');
            service.beginDate.time =  beginDateMoment.format('LT');
            var endDateMoment = moment(service.shipment.shipmentInfo.endDate).local();
            service.endDate.value = endDateMoment.toDate();
            service.endDate.date = endDateMoment.format('L');
            service.endDate.time =  endDateMoment.format('LT');
            service.trackDeviceReturn.value = service.shipment.shipmentInfo.trackReverseLogistics;
            service.subscribers =  service.shipment.shipmentInfo.subscribers !== null ? service.shipment.shipmentInfo.subscribers : [];
            service.shipmentEmails.value =  service.shipment.shipmentInfo.shipmentEmails !== null ? joinEmails(service.shipment.shipmentInfo.shipmentEmails): null;
            service.notes.value = service.shipment.shipmentInfo.notes;
            service.canEdit = service.shipment.shipmentInfo.status.toLowerCase() !== 'complete' && service.shipment.shipmentInfo.status.toLowerCase() !== 'cancelled' && service.shipment.shipmentInfo.status.toLowerCase() !== 'expired';

            service.sentinels = service.shipment.shipmentInfo.sentinels;
            service.beginTrackingStrategyType.value = service.shipment.shipmentInfo.beginTrackingStrategyType;
            service.endTrackingStrategyType.value = service.shipment.shipmentInfo.endTrackingStrategyType;

            if(service.beginTrackingStrategyType.value === "ArrivalGeofence"){
                loadGeofence(service.shipment.shipmentInfo.beginTrackingArrivalGeofenceId, "begin");
            } else if(service.beginTrackingStrategyType.value === "DepartureGeofence"){
                loadGeofence(service.shipment.shipmentInfo.beginTrackingDepartureGeofenceId, "begin");
            }

            if(service.endTrackingStrategyType.value === "ArrivalGeofence"){
                loadGeofence(service.shipment.shipmentInfo.endTrackingArrivalGeofenceId, "end");
            }

            _.forEach(service.shipment.shipmentStops, function(shipmentStop, index) {
                if (index === 0) {
                    service.stops.origin = editorStop(shipmentStop);
                    return;
                }
                if (index === service.shipment.shipmentStops.length - 1) {
                    service.stops.destination = editorStop(shipmentStop);
                    return;
                }

                var otherStop = editorStop(shipmentStop);
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

        function saveNewStops(shipment){
            var stops = [];
            _.forEach(service.stops.other, function (stop) {
                stops.push(stopToSave(stop));
            });
            return ShipmentsService.addStops(shipment.shipmentInfo.shipmentId,stops);
        }

        function saveNew() {
            service.feedback.clear();
            validate();

            if (!service.isValid) {
                return null;
            }            

            var shipmentToSave = {
                shipmentInfo: {
                    clientGuid: SentinelUiSession.focus.id,
                    referenceNumber: SentinelUiSession.focus.trackingConfig && SentinelUiSession.focus.trackingConfig.referencePrefix ?
                        SentinelUiSession.focus.trackingConfig.referencePrefix + service.referenceNumber.value :
                        service.referenceNumber.value,
                    deviceTagId: service.device.value.imei,
                    startDate: moment().utc().format(),
                    sentinels: [],
                    endDate: moment(service.endDate.value).utc().format(),
                    notes: service.notes.value,
                    subscribers: service.subscribers,
                    shipmentEmails: service.shipmentEmails.value ? buildArrayEmails(service.shipmentEmails.value.replace(/\s/g,'').split(";").join(",").split(',')) : [],
                    trackReverseLogistics: service.trackDeviceReturn.value
                },
                shipmentStops:[]
            };

            _.forEach(service.sentinels,function(s){
                shipmentToSave.shipmentInfo.sentinels.push({
                    "sentinelId":s.sentinelId,
                    "deviceId":s.deviceId
                });
            });

            shipmentToSave.shipmentInfo.beginTrackingStrategyType = service.beginTrackingStrategyType.value;
            shipmentToSave.shipmentInfo.endTrackingStrategyType = service.endTrackingStrategyType.value;

            if(service.beginTrackingStrategyType.value === "date/time"){
                shipmentToSave.shipmentInfo.startDate = moment(service.beginDate.value).utc().format();
            } else if(service.beginTrackingStrategyType.value === "ArrivalGeofence"){
                shipmentToSave.shipmentInfo.beginTrackingArrivalGeofenceId = service.endGeofence.value.id;
            } else if(service.beginTrackingStrategyType.value === "DepartureGeofence"){
                shipmentToSave.shipmentInfo.beginTrackingDepartureGeofenceId = service.beginGeofence.value.id;
            } else if(service.beginTrackingStrategyType.value === "Immediately"){
                //Nothing
            }

            if(service.endTrackingStrategyType.value === "date/time"){
                shipmentToSave.shipmentInfo.endDate = moment(service.endDate.value).utc().format();
            } else if(service.endTrackingStrategyType.value === "ArrivalGeofence"){
                shipmentToSave.shipmentInfo.endTrackingArrivalGeofenceId = service.endGeofence2.value.id;
            }

            /*if (service.stops.origin.type !== 'blank') {
                shipmentToSave.shipmentStops.push(stopToSave(service.stops.origin));
            }
            _.forEach(service.stops.other, function (stop) {
                shipmentToSave.shipmentStops.push(stopToSave(stop));
            });
            if (service.stops.destination.type !== 'blank') {
                shipmentToSave.shipmentStops.push(stopToSave(service.stops.destination));
            }*/

            console.log(shipmentToSave);
            return ShipmentsService.createShipment(shipmentToSave);
        }

        function preSaveShipmentInfo(){
            service.feedback.clear();

            if (!service.canEdit) {
                service.feedback.addError('Shipment can not be changed');
                return null;
            }

            validateShipmentInfo();

            if (!service.isValidInfo) {
                return null;
            }

            var shipmentInfoToSave = {
                shipmentId: service.shipment.shipmentInfo.shipmentId,
                clientGuid: service.shipment.shipmentInfo.clientGuid,
                referenceNumber: SentinelUiSession.focus.trackingConfig && SentinelUiSession.focus.trackingConfig.referencePrefix ?
                SentinelUiSession.focus.trackingConfig.referencePrefix + service.referenceNumber.value :
                    service.referenceNumber.value,
                deviceTagId: service.device.value.imei,
                startDate: moment().utc().format(),
                sentinels: [],
                status:"",
                endDate: moment(service.endDate.value).utc().format(),
                notes: service.notes.value,
                subscribers: service.subscribers,
                shipmentEmails: service.shipmentEmails.value ? buildArrayEmails(service.shipmentEmails.value.replace(/\s/g,'').split(";").join(",").split(',')) : [],
                trackReverseLogistics: service.trackDeviceReturn.value
            };

            _.forEach(service.sentinels,function(s){
                shipmentInfoToSave.sentinels.push({
                    "sentinelId":s.sentinelId,
                    "deviceId":s.deviceId
                });
            });

            shipmentInfoToSave.beginTrackingStrategyType = service.beginTrackingStrategyType.value;
            shipmentInfoToSave.endTrackingStrategyType = service.endTrackingStrategyType.value;

            if(service.beginTrackingStrategyType.value === "date/time"){
                shipmentInfoToSave.startDate = moment(service.beginDate.value).utc().format();
            } else if(service.beginTrackingStrategyType.value === "ArrivalGeofence"){
                shipmentInfoToSave.beginTrackingArrivalGeofenceId = service.endGeofence.value.id;
            } else if(service.beginTrackingStrategyType.value === "DepartureGeofence"){
                shipmentInfoToSave.beginTrackingDepartureGeofenceId = service.beginGeofence.value.id;
            } else if(service.beginTrackingStrategyType.value === "Immediately"){
                //Nothing
                if(service.beginTrackingStrategyTypeOld==="Immediately")
                    shipmentInfoToSave.startDate = moment(service.beginDate.value).utc().format();
            }

            if(service.endTrackingStrategyType.value === "date/time"){
                shipmentInfoToSave.endDate = moment(service.endDate.value).utc().format();
            } else if(service.endTrackingStrategyType.value === "ArrivalGeofence"){
                shipmentInfoToSave.endTrackingArrivalGeofenceId = service.endGeofence2.value.id;
            }

            var now = moment();

            //Reset status to Pending when the current status is Overdue and beginTrackingStrategyType is
            //Immediately 
            if( service.beginTrackingStrategyTypeOld!="Immediately" && 
                    service.beginTrackingStrategyType.value === "Immediately" && 
                    service.shipment.shipmentInfo.status === "Overdue"){
                shipmentInfoToSave.status = "Pending";
            } 
            //Reset status to Pending when the current status is Overdue and beginTrackingStrategyType is
            //date/time and the startDate is in the future date 
            else if(service.beginTrackingStrategyType.value === "date/time" && 
                    service.shipment.shipmentInfo.status === "Overdue" && 
                    moment(shipmentInfoToSave.startDate).isSameOrAfter(now)){
                shipmentInfoToSave.status = "Pending";
            //Reset status to Pending when the current status is Overdue and endTrackingStrategyType is
            //date/time and the endDate is in the future date 
            } else if(service.endTrackingStrategyType.value === "date/time" &&
                    service.shipment.shipmentInfo.status === "Overdue") {
               var durationInMinutes = now.diff(moment(shipmentInfoToSave.endDate),'minutes',true);
               console.log("durationInMinutes",durationInMinutes);
               if(durationInMinutes>=0 && durationInMinutes<1){
                   console.log("Complete");
                   shipmentInfoToSave.status = "Complete";
               } else if(durationInMinutes>=1) {
                   console.log("Pending");
                   shipmentInfoToSave.status = "Pending";
               }
               
            }

            return shipmentInfoToSave;
        }

        function saveShipmentInfo() {
            
            var shipmentInfoToSave = preSaveShipmentInfo();

            if(!shipmentInfoToSave)
                return null;

            return ShipmentsService.updateInfo(shipmentInfoToSave);
        }

        function stopsHaveError() {

            var otherError = false;
            _.forEach(service.stops.other, function(stop) {
                otherError = stop.hasError() || otherError;
            });
            return /*service.stops.origin.hasError() || service.stops.destination.hasError() ||*/ otherError;
        }

        function stopToSave(editorStop) {
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
        }        

        function validate() {
            service.isValid = true;
            validateShipmentInfo();
            validateStops();
            validateSubscribers();
            service.isValid = service.isValidInfo && !service.shipmentEmails.hasError();
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

        function validateBeginGeofence() {
            service.beginGeofence.isPristine = false;
            service.beginGeofence.errors.isNotFound = false;
            service.beginGeofence.errors.isBlank = service.beginGeofence.value === null;
            if (service.beginGeofence.errors.isBlank) {
                return;
            }

            //TODO get from endpoint the geofence to validate if exists
        }

        function validateEndGeofence() {
            service.endGeofence.isPristine = false;
            service.endGeofence.errors.isNotFound = false;
            service.endGeofence.errors.isBlank = service.endGeofence.value === null;
            if (service.endGeofence.errors.isBlank) {
                return;
            }

            //TODO get from endpoint the geofence to validate if exists
        }

        function validateEndGeofence2() {
            service.endGeofence2.isPristine = false;
            service.endGeofence2.errors.isNotFound = false;
            service.endGeofence2.errors.isBlank = service.endGeofence2.value === null;
            if (service.endGeofence2.errors.isBlank) {
                return;
            }

            //TODO get from endpoint the geofence to validate if exists
        }

        function validateEndDate() {
            service.endDate.errors.isBlank = false;
            service.endDate.errors.isTimeBlank = false;
            service.endDate.errors.isNotADate = false;
            service.endDate.errors.isNotATime = false;
            service.endDate.errors.isBeforeNow = false;
            service.endDate.isPristine = false;

            service.endDate.errors.isBlank = typeof service.endDate.date === 'undefined' || service.endDate.date === null;
            if (service.endDate.errors.isBlank) {
                return;
            }

            service.endDate.errors.isTimeBlank = typeof service.endDate.time === 'undefined' || service.endDate.time === null || service.endDate.time.trim() === '';
            if (service.endDate.errors.isTimeBlank) {
                return;
            }

            var endDateTimeMoment = DatetimeValidatorService.toMoment(service.endDate.date, service.endDate.time);
            if (!endDateTimeMoment) {
                service.endDate.errors.isNotADate = DatetimeValidatorService.dateError;
                service.endDate.errors.isNotATime = DatetimeValidatorService.timeError;
                return;
            }

            console.log("now",moment());
            console.log("endDateTimeMoment",endDateTimeMoment);

            var diffInMinutes = moment(endDateTimeMoment).diff(moment(),'minutes',true);

            console.log("diffInMinutes",diffInMinutes);

            service.endDate.errors.isBeforeNow = diffInMinutes < -1; //endDateTimeMoment.isBefore(moment());
            if (service.endDate.errors.isBeforeNow) {
                return;
            }

            service.endDate.value = endDateTimeMoment.toDate();
        }

        function validateBeginDate() {
            service.beginDate.errors.isBlank = false;
            service.beginDate.errors.isTimeBlank = false;
            service.beginDate.errors.isNotADate = false;
            service.beginDate.errors.isNotATime = false;
            service.beginDate.errors.isBeforeNow = false;
            service.beginDate.isPristine = false;

            service.beginDate.errors.isBlank = typeof service.beginDate.date === 'undefined' || service.beginDate.date === null;
            if (service.beginDate.errors.isBlank) {
                return;
            }

            service.beginDate.errors.isTimeBlank = typeof service.beginDate.time === 'undefined' || service.beginDate.time === null || service.beginDate.time.trim() === '';
            if (service.beginDate.errors.isTimeBlank) {
                return;
            }

            var beginDateTimeMoment = DatetimeValidatorService.toMoment(service.beginDate.date, service.beginDate.time);
            if (!beginDateTimeMoment) {
                service.beginDate.errors.isNotADate = DatetimeValidatorService.dateError;
                service.beginDate.errors.isNotATime = DatetimeValidatorService.timeError;
                return;
            }

            /*service.beginDate.errors.isBeforeNow = beginDateTimeMoment.isBefore(moment());
            if (service.beginDate.errors.isBeforeNow) {
                return;
            }*/

            service.beginDate.value = beginDateTimeMoment.toDate();
        }

        function validateReferenceNumber() {
            service.referenceNumber.isPristine = false;
            service.referenceNumber.errors.isBlank = true;
            service.referenceNumber.errors.isDuplicate = false;
            service.referenceNumber.errors.isWrongPrefix = false;
            service.referenceNumber.errors.isTooLong = false;
            service.referenceNumber.errors.hasInvalidCharacters = false;

            //validate a value exists
            service.referenceNumber.errors.isBlank = !service.referenceNumber.value || service.referenceNumber.value.trim() === '';
            if (service.referenceNumber.errors.isBlank) {
                return;
            }

            service.referenceNumber.errors.isTooLong = (SentinelUiSession.focus.trackingConfig && SentinelUiSession.focus.trackingConfig.referencePrefix && SentinelUiSession.focus.trackingConfig.referencePrefix.length + service.referenceNumber.value.length > 30) || service.referenceNumber.value.length > 30;
            if (service.referenceNumber.errors.isTooLong) {
                return;
            }

            //validate reference number is unique
            var referenceNumberToCheck = SentinelUiSession.focus.trackingConfig && SentinelUiSession.focus.trackingConfig.referencePrefix ?
            SentinelUiSession.focus.trackingConfig.referencePrefix + service.referenceNumber.value :
                service.referenceNumber.value;
            var promise = ShipmentsService.getShipmentByRef(SentinelUiSession.focus, referenceNumberToCheck).$promise;
            promise.then(
                function (result) {
                    if (service.shipment !== null && service.shipment.shipmentInfo.shipmentId === result.shipmentInfo.shipmentId) {
                        return;
                    }

                    if (result.shipmentInfo.status.toLowerCase() !== 'cancelled') {
                        service.referenceNumber.errors.isDuplicate = true;
                    }
                },
                function (error) {
                    if (error.status === 404) {
                        //we expect this to occur, so ignore it
                    }
                }
            );
        }

        function validateShipmentInfo() {
            service.isValidInfo = true;
            validateReferenceNumber();
            validateDevice();
            validateSubscribers();

            var beginDateHasError = false;
            var endDateHasError = false;
            var beginGeofenceHasError = false;
            var endGeofenceHasError = false;
            var endGeofence2HasError = false;

            if(service.beginTrackingStrategyType.value === "date/time"){
                validateBeginDate();
                beginDateHasError = service.beginDate.hasError();
            }

            if(service.endTrackingStrategyType.value === "date/time"){
                validateEndDate();
                endDateHasError = service.endDate.hasError();
            }

            if(service.beginTrackingStrategyType.value === "ArrivalGeofence"){
                validateEndGeofence();
                endGeofenceHasError = service.endGeofence.hasError();

            } else if(service.beginTrackingStrategyType.value === "DepartureGeofence"){
                validateBeginGeofence();
                beginGeofenceHasError = service.beginGeofence.hasError();
            }

            if(service.endTrackingStrategyType.value === "ArrivalGeofence"){
                validateEndGeofence2();
                endGeofence2HasError = service.endGeofence2.hasError();
            }

            service.isValidInfo = !(service.referenceNumber.hasError() ||
                service.device.hasError() ||
                endDateHasError ||
                beginDateHasError ||
                beginGeofenceHasError ||
                endGeofenceHasError ||
                endGeofence2HasError || 
                service.shipmentEmails.hasError());
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

        function validateStops() {
            //validateStop(service.stops.origin);
            _.forEach(service.stops.other, function (stop) {
                validateStop(stop);
            });
            //validateStop(service.stops.destination);

            //todo: validate stop round trip
        }

        function completeShipment() {
            if (!service.canEdit) {
                service.feedback.addError('Shipment can not be changed');
                return null;
            }
            vm.feedback.clear();

            var promise = ShipmentsService.completeShipment(service.shipment.shipmentInfo.shipmentId).$promise;
            promise.then(
                function(result) {
                    var referenceNumber = service.referencePrefix ?  service.referencePrefix + service.referenceNumber.value : service.referenceNumber.value;
                    service.feedback.addSuccess('Shipment ' + referenceNumber + ' has been completed manually');
                    service.shipment.shipmentInfo.status = 'Completed';
                    service.canEdit = false;
                },
                function (error) {
                    service.addError(error.data.message);
                }
            );
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
                    console.log("email to validate",email.trim());
                    var isEmail = emailValidator.test(email.trim());
                    console.log("isEmail",isEmail);
                    if (!isEmail) {
                        service.shipmentEmails.errors.invalidEmails.push(email.trim());
                    }
                }
            });
        }
    }


})();