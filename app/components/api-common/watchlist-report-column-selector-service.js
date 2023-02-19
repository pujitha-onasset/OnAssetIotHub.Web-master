(function() {
    'use strict';

    angular
        .module('api-common')
        .factory('WatchlistReportColumnSelectorService', WatchlistReportColumnSelectorService);

    WatchlistReportColumnSelectorService.$inject = ['localStorageService'];
    function WatchlistReportColumnSelectorService(localStorageService) {
        var _localStorageKey = 'watchlistReportColumnSelectorService';
        
        var service = {
            age: false,
            battery: false,
            humidity: false,
            isButtonPushed: false,
            isMotionDetected: false,
            latLng: false,
            light: false,
            locationMethod: false,
            messageTimeStamp: false,
            pressure: false,
            sentinelLogDataId: false,
            serverTimeStamp: false,
            shockMagnitude: false,
            shockXYZ: false,
            signalQuality: false,
            temperatureC: false,
            temperatureF: false,
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
            service.battery = true;
            service.humidity = true;
            service.isButtonPushed = true;
            service.isMotionDetected = false;
            service.latLng = false;
            service.light = true;
            service.locationMethod = false;
            service.messageTimeStamp = true;
            service.pressure = true;
            service.sentinelLogDataId = false;
            service.serverTimeStamp = false;
            service.shockMagnitude = true;
            service.shockXYZ = false;
            service.signalQuality = true;
            service.temperatureC = true;
            service.temperatureF = true;
            updateCount();
            localStorageService.set(_localStorageKey, null);
        }

        function restore(settings) {
            service.age = settings.age;
            service.battery = settings.battery;
            service.humidity = settings.humidity;
            service.isButtonPushed = settings.isButtonPushed;
            service.isMotionDetected = settings.isMotionDetected;
            service.latLng = settings.latLng;
            service.light = settings.light;
            service.locationMethod = settings.locationMethod;
            service.messageTimeStamp = settings.messageTimeStamp;
            service.pressure = settings.pressure;
            service.sentinelLogDataId = settings.sentinelLogDataId;
            service.serverTimeStamp = settings.serverTimeStamp;
            service.shockMagnitude = settings.shockMagnitude;
            service.shockXYZ = settings.shockXYZ;
            service.signalQuality = settings.signalQuality;
            service.temperatureC = settings.temperatureC;
            service.temperatureF = settings.temperatureF;
            updateCount();
        }

        function selectAll() {
            service.age = true;
            service.battery = true;
            service.humidity = true;
            service.isButtonPushed = true;
            service.isMotionDetected = true;
            service.latLng = true;
            service.light = true;
            service.locationMethod = true;
            service.messageTimeStamp = true;
            service.pressure = true;
            service.sentinelLogDataId = true;
            service.serverTimeStamp = true;
            service.shockMagnitude = true;
            service.shockXYZ = true;
            service.signalQuality = true;
            service.temperatureC = true;
            service.temperatureF = true;
            updateCount();
            store();
        }

        function selectNone() {
            service.age = false;
            service.battery = false;
            service.humidity = false;
            service.isButtonPushed = false;
            service.isMotionDetected = false;
            service.latLng = false;
            service.light = false;
            service.locationMethod = false;
            service.messageTimeStamp = false;
            service.pressure = false;
            service.sentinelLogDataId = false;
            service.serverTimeStamp = false;
            service.shockMagnitude = false;
            service.shockXYZ = false;
            service.signalQuality = false;
            service.temperatureC = false;
            service.temperatureF = false;
            updateCount();
            store();
        }
        
        function store() {
            localStorageService.set(_localStorageKey, {
                age: service.age,
                battery: service.battery,
                humidity: service.humidity,
                isButtonPushed: service.isButtonPushed,
                isMotionDetected: service.isMotionDetected,
                latLng: service.latLng,
                light: service.light,
                locationMethod: service.locationMethod,
                messageTimeStamp: service.messageTimeStamp,
                pressure: service.pressure,
                sentinelLogDataId: service.sentinelLogDataId,
                serverTimeStamp: service.serverTimeStamp,
                shockMagnitude: service.shockMagnitude,
                shockXYZ: service.shockXYZ,
                signalQuality: service.signalQuality,
                temperatureC: service.temperatureC,
                temperatureF: service.temperatureF
            });
        }

        function toggle(column) {
            service[column] = !service[column];
            updateCount();
            store();
        }
    }
})();