(function() {
    'use strict';

    angular
        .module('api-common')
        .factory('SentryReportColumnSelectorService', SentryReportColumnSelectorService);

    SentryReportColumnSelectorService.$inject = ['localStorageService'];
    function SentryReportColumnSelectorService(localStorageService) {
        var _localStorageKey = 'sentryReportColumnSelectorService';
        
        var service = {
            age: false,
            alarms: false,
            activatedAlarms: false,
            battery: false,
            communicationType: false,
            humidity: false,
            isButtonPushed: false,
            isMotionDetected: false,
            isStoreAndForward: false,
            latLng: false,
            light: false,
            locationMethod: false,
            messageTimeStamp: false,
            messageRefNumber: false,
            pressure: false,
            reportGuid: false,
            reportId: false,
            reportInterval: false,
            serverTimeStamp: false,
            shockMagnitude: false,
            tiltMagnitude: false,
            shockElapsedTime: false,
            shockXYZ: false,
            tiltXYZ: false,
            signalQuality: false,
            dewPointC: false,
            dewPointF: false,
            extSwitch: false,
            temperatureC: false,
            temperatureF: false,
            temperatureProbe1C: false,
            temperatureProbe1F: false,
            temperatureProbe2C: false,
            temperatureProbe2F: false,
            bleLocation: false,
            countOfSightings: 0,
            reset: reset,
            selectNone: selectNone,
            selectAll: selectAll,
            count: 0,
            toggle: toggle
        };
        activate();
        return service;

        /////////////////////////////////////////////

        function activate() {
            var storedSettings = localStorageService.get(_localStorageKey);
            if (!storedSettings) {
                reset();
            }
            else {
                restore(storedSettings);
            }
        }
        
        function updateCount() {
            var count = 0;
            _.forEach(service, function(column) {
               if (column === true) {
                   count++;
               } 
            });
            
            service.count = count;
        }
        
        function reset() {
            service.age = true;
            service.alarms = true;
            service.activatedAlarms = true;
            service.battery = true;
            service.communicationType = false;
            service.humidity = true;
            service.isButtonPushed = true;
            service.isMotionDetected = true;
            service.isStoreAndForward = true;
            service.latLng = false;
            service.light = true;
            service.locationMethod = false;
            service.messageTimeStamp = true;
            service.messageRefNumber = true;
            service.pressure = true;
            service.reportGuid = false;
            service.reportId = false;
            service.reportInterval = true;
            service.serverTimeStamp = true;
            service.shockMagnitude = true;
            service.shockElapsedTime = true;
            service.tiltMagnitude = true;
            service.shockXYZ = false;
            service.tiltXYZ = false;
            service.signalQuality = true;
            service.dewPointC = true;
            service.dewPointF = true;
            service.extSwitch = true;
            service.temperatureC = true;
            service.temperatureF = true;
            service.temperatureProbe1C = true;
            service.temperatureProbe1F = true;
            service.temperatureProbe2C = true;
            service.temperatureProbe2F = true;
            service.bleLocation = true;
            service.countOfSightings = true;
            updateCount();
            localStorageService.set(_localStorageKey, null);
        }

        function restore(settings) {
            service.age = settings.age;
            service.alarms = settings.alarms;
            service.activatedAlarms = settings.activatedAlarms;
            service.battery = settings.battery;
            service.communicationType = settings.communicationType;
            service.humidity = settings.humidity;
            service.isButtonPushed = settings.isButtonPushed;
            service.isMotionDetected = settings.isMotionDetected;
            service.isStoreAndForward = settings.isStoreAndForward;
            service.latLng = settings.latLng;
            service.light = settings.light;
            service.locationMethod = settings.locationMethod;
            service.messageTimeStamp = settings.messageTimeStamp;
            service.messageRefNumber = settings.messageRefNumber;
            service.pressure = settings.pressure;
            service.reportGuid = settings.reportGuid;
            service.reportId = settings.reportId;
            service.reportInterval = settings.reportInterval;
            service.serverTimeStamp = settings.serverTimeStamp;
            service.shockMagnitude = settings.shockMagnitude;
            service.shockElapsedTime = settings.shockElapsedTime;
            service.shockXYZ = settings.shockXYZ;
            service.tiltXYZ = settings.tiltXYZ;
            service.signalQuality = settings.signalQuality;
            service.dewPointC = settings.dewPointC;
            service.dewPointF = settings.dewPointF;
            service.extSwitch = settings.extSwitch;
            service.temperatureC = settings.temperatureC;
            service.temperatureF = settings.temperatureF;
            service.temperatureProbe1C = settings.temperatureProbe1C;
            service.temperatureProbe1F = settings.temperatureProbe1F;
            service.temperatureProbe2C = settings.temperatureProbe2C;
            service.temperatureProbe2F = settings.temperatureProbe2F;
            service.bleLocation = settings.bleLocation;
            service.countOfSightings = settings.countOfSightings;
            updateCount();
        }

        function selectAll() {
            service.age = true;
            service.alarms = true;
            service.activatedAlarms = true;
            service.battery = true;
            service.communicationType = true;
            service.humidity = true;
            service.isButtonPushed = true;
            service.isMotionDetected = true;
            service.isStoreAndForward = true;
            service.latLng = true;
            service.light = true;
            service.locationMethod = true;
            service.messageTimeStamp = true;
            service.messageRefNumber = true;
            service.pressure = true;
            service.reportGuid = true;
            service.reportId = true;
            service.reportInterval = true;
            service.serverTimeStamp = true;
            service.shockMagnitude = true;
            service.shockElapsedTime = true;
            service.shockXYZ = true;
            service.tiltXYZ = true;
            service.signalQuality = true;
            service.dewPointC = true;
            service.dewPointF = true;
            service.extSwitch = true;
            service.temperatureC = true;
            service.temperatureF = true;
            service.temperatureProbe1C = true;
            service.temperatureProbe1F = true;
            service.temperatureProbe2C = true;
            service.temperatureProbe2F = true;
            service.bleLocation = true;
            service.countOfSightings = true;
            updateCount();
            store();
        }

        function selectNone() {
            service.age = false;
            service.alarms = false;
            service.activatedAlarms = false;
            service.battery = false;
            service.communicationType = false;
            service.humidity = false;
            service.isButtonPushed = false;
            service.isMotionDetected = false;
            service.isStoreAndForward = false;
            service.latLng = false;
            service.light = false;
            service.locationMethod = false;
            service.messageTimeStamp = false;
            service.messageRefNumber = false;
            service.pressure = false;
            service.reportGuid = false;
            service.reportId = false;
            service.reportInterval = false;
            service.serverTimeStamp = false;
            service.shockMagnitude = false;
            service.shockElapsedTime = false;
            service.shockXYZ = false;
            service.tiltXYZ = false;
            service.signalQuality = false;
            service.dewPointC = false;
            service.dewPointF = false;
            service.extSwitch = false;
            service.temperatureC = false;
            service.temperatureF = false;
            service.temperatureProbe1C = false;
            service.temperatureProbe1F = false;
            service.temperatureProbe2C = false;
            service.temperatureProbe2F = false;
            service.bleLocation = false;
            service.countOfSightings = false;
            updateCount();
            store();
        }
        
        function store() {
            localStorageService.set(_localStorageKey, {
                age: service.age,
                alarms: service.alarms,
                activatedAlarms: service.activatedAlarms,
                battery: service.battery,
                communicationType: service.communicationType,
                humidity: service.humidity,
                isButtonPushed: service.isButtonPushed,
                isMotionDetected: service.isMotionDetected,
                isStoreAndForward: service.isStoreAndForward,
                latLng: service.latLng,
                light: service.light,
                locationMethod: service.locationMethod,
                messageTimeStamp: service.messageTimeStamp,
                messageRefNumber: service.messageRefNumber,
                pressure: service.pressure,
                reportGuid: service.reportGuid,
                reportId: service.reportId,
                reportInterval: service.reportInterval,
                serverTimeStamp: service.serverTimeStamp,
                shockMagnitude: service.shockMagnitude,
                shockElapsedTime: service.shockElapsedTime,
                shockXYZ: service.shockXYZ,
                tiltXYZ: service.tiltXYZ,
                signalQuality: service.signalQuality,
                dewPointC: service.dewPointC,
                dewPointF: service.dewPointF,
                extSwitch: service.extSwitch,
                temperatureC: service.temperatureC,
                temperatureF: service.temperatureF,
                temperatureProbe1C: service.temperatureProbe1C,
                temperatureProbe1F: service.temperatureProbe1F,
                temperatureProbe2C: service.temperatureProbe2C,
                temperatureProbe2F: service.temperatureProbe2F,
                bleLocation: service.bleLocation,
                countOfSightings: service.countOfSightings
            });
        }

        function toggle(column) {
            service[column] = !service[column];
            updateCount();
            store();
        }
    }
})();