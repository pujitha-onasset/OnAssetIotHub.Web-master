(function() {
    'use strict';

    angular
        .module('api-common')
        .factory('SentinelReportColumnSelectorService', SentinelReportColumnSelectorService);

    SentinelReportColumnSelectorService.$inject = ['localStorageService'];
    function SentinelReportColumnSelectorService(localStorageService) {
        var _localStorageKey = 'SentinelReportColumnSelectorService';
        
        var service = {
            age: false,
            alarms: false,
            activatedAlarms: false,
            battery: false,
            dewPointC: false,
            dewPointF: false,
            sentinelId:false,
            imei: false,
            humidity: false,
            latLng: false,
            light: false,
            locationMethod: false,
            messageTimeStamp: false,
            messageRefNumber: false,
            pressure: false,
            reportGuid: false,
            reportId: false,
            serverTimeStamp: false,
            shockMagnitude: false,
            shockXYZ: false,
            tiltXYZ: false,
            signalQuality: false,
            temperatureC: false,
            temperatureF: false,
            temperatureProbeC: false,
            temperatureProbeF: false,
            temperatureProbe2C: false,
            temperatureProbe2F: false,
            bleLocation: false,
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
            service.dewPointC = true,
            service.dewPointF = true,
            service.sentinelId = false;
            service.imei = false;
            service.humidity = true;
            service.latLng = false;
            service.light = true;
            service.locationMethod = false;
            service.messageTimeStamp = true;
            service.messageRefNumber = true;
            service.pressure = true;
            service.reportGuid = false;
            service.reportId = false;
            service.serverTimeStamp = false;
            service.shockMagnitude = true;
            service.shockXYZ = false;
            service.tiltXYZ=false;
            service.signalQuality = true;
            service.temperatureC = true;
            service.temperatureF = true;
            service.temperatureProbeC = true;
            service.temperatureProbeF = true;
            service.temperatureProbe2C = true;
            service.temperatureProbe2F = true;
            service.bleLocation = true;
            updateCount();
            localStorageService.set(_localStorageKey, null);
        }

        function restore(settings) {
            service.age = settings.age;
            service.alarms = settings.alarms;
            service.activatedAlarms = settings.activatedAlarms;
            service.battery = settings.battery;
            service.dewPointC = settings.dewPointC;
            service.dewPointF = settings.dewPointF;
            service.sentinelId = settings.sentinelId;
            service.imei = settings.imei;
            service.humidity = settings.humidity;
            service.latLng = settings.latLng;
            service.light = settings.light;
            service.locationMethod = settings.locationMethod;
            service.messageTimeStamp = settings.messageTimeStamp;
            service.messageRefNumber = settings.messageRefNumber;
            service.pressure = settings.pressure;
            service.reportGuid = settings.reportGuid;
            service.reportId = settings.reportId;
            service.serverTimeStamp = settings.serverTimeStamp;
            service.shockMagnitude = settings.shockMagnitude;
            service.shockXYZ = settings.shockXYZ;
            service.tiltXYZ = settings.tiltXYZ;
            service.signalQuality = settings.signalQuality;
            service.temperatureC = settings.temperatureC;
            service.temperatureF = settings.temperatureF;
            service.temperatureProbeC = settings.temperatureProbeC;
            service.temperatureProbeF = settings.temperatureProbeF;
            service.temperatureProbe2C = settings.temperatureProbe2C;
            service.temperatureProbe2F = settings.temperatureProbe2F;
            service.bleLocation = settings.bleLocation;
            updateCount();
        }

        function selectAll() {
            service.age = true;
            service.alarms = true;
            service.activatedAlarms = true;
            service.battery = true;
            service.dewPointC = true;
            service.dewPointF = true;
            service.sentinelId = false;
            service.imei = true;
            service.humidity = true;
            service.latLng = true;
            service.light = true;
            service.locationMethod = true;
            service.messageTimeStamp = true;
            service.messageRefNumber = true;
            service.pressure = true;
            service.reportGuid = true;
            service.reportId = true;
            service.serverTimeStamp = true;
            service.shockMagnitude = true;
            service.shockXYZ = true;
            service.tiltXYZ = true;
            service.signalQuality = true;
            service.temperatureC = true;
            service.temperatureF = true;
            service.temperatureProbeC = true;
            service.temperatureProbeF = true;
            service.temperatureProbe2C = true;
            service.temperatureProbe2F = true;
            service.bleLocation = true;
            updateCount();
            store();
        }

        function selectNone() {
            service.age = false;
            service.alarms = false;
            service.activatedAlarms = false;
            service.battery = false;
            service.dewPointC = false;
            service.dewPointF = false;
            service.sentinelId = false;
            service.imei = false;
            service.humidity = false;
            service.isButtonPushed = false;
            service.isMotionDetected = false;
            service.latLng = false;
            service.light = false;
            service.locationMethod = false;
            service.messageTimeStamp = false;
            service.messageRefNumber = false;
            service.pressure = false;
            service.reportGuid = false;
            service.reportId = false;
            service.serverTimeStamp = false;
            service.shockMagnitude = false;
            service.shockXYZ = false;
            service.tiltkXYZ = false;
            service.signalQuality = false;
            service.temperatureC = false;
            service.temperatureF = false;
            service.temperatureProbeC = false;
            service.temperatureProbeF = false;
            service.temperatureProbe2C = false;
            service.temperatureProbe2F = false;
            service.bleLocation = false;
            updateCount();
            store();
        }
        
        function store() {
            localStorageService.set(_localStorageKey, {
                age: service.age,
                alarms: service.alarms,
                activatedAlarms: service.activatedAlarms,
                battery: service.battery,
                dewPointC: service.dewPointC,
                dewPointF: service.dewPointF,
                sentinelId: service.sentinelId,
                imei: service.imei,
                humidity: service.humidity,
                isButtonPushed: service.isButtonPushed,
                isMotionDetected: service.isMotionDetected,
                latLng: service.latLng,
                light: service.light,
                locationMethod: service.locationMethod,
                messageTimeStamp: service.messageTimeStamp,
                messageRefNumber: service.messageRefNumber,
                pressure: service.pressure,
                reportGuid: service.reportGuid,
                reportId: service.reportId,
                serverTimeStamp: service.serverTimeStamp,
                shockMagnitude: service.shockMagnitude,
                shockXYZ: service.shockXYZ,
                tiltXYZ: service.tiltkXYZ,
                signalQuality: service.signalQuality,
                temperatureC: service.temperatureC,
                temperatureF: service.temperatureF,
                temperatureProbeC: service.temperatureProbeC,
                temperatureProbeF: service.temperatureProbeF,
                temperatureProbe2C: service.temperatureProbe2C,
                temperatureProbe2F: service.temperatureProbe2F,
                bleLocation: service.bleLocation
            });
        }

        function toggle(column) {
            service[column] = !service[column];
            updateCount();
            store();
        }
    }
})();