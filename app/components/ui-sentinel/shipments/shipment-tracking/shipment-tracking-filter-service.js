(function () {
    'use strict';

    angular
        .module('ui-sentinel.shipments.shipmentTracking')
        .factory('ShipmentTrackingFilterService', ShipmentTrackingFilterService);

    ShipmentTrackingFilterService.$inject = ['localStorageService'];
    function ShipmentTrackingFilterService(localStorageService) {
        var localStorageKey = 'ShipmentTrackingFilterService';
        var filterSettings = localStorageService.get(localStorageKey);

        var service = {
            searchText: filterSettings ? filterSettings.searchText : null,
            showOk: filterSettings ? filterSettings.showOk : true,
            showInfo: filterSettings ? filterSettings.showInfo : true,
            showWarning: filterSettings ? filterSettings.showWarning : true,
            isAbove: isAbove,
            isBelow: isBelow,
            isBetween: isBetween,
            isOutside: isOutside,
            filterByPropertyName: filterSettings ? filterSettings.filterByPropertyName : 'Battery (%)',
            range: {
                property: filterSettings ? filterSettings.range.property : 'batteryPercent',
                min: filterSettings ? filterSettings.range.min : 0,
                max: filterSettings ? filterSettings.range.max : 100,
                above: filterSettings ? filterSettings.range.above : 0,
                below: filterSettings ? filterSettings.range.below : 100,
                from: filterSettings ? filterSettings.range.from : 0,
                to: filterSettings ? filterSettings.range.to : 100,
                filterOption: filterSettings ? filterSettings.range.filterOption : 'none',
                suffix: filterSettings ? filterSettings.range.suffix : '%'
            },
            filter: filter,
            filterByBattery: filterByBattery,
            filterByTemperatureC: filterByTemperatureC,
            filterByTemperatureF: filterByTemperatureF,
            filterByTempProbe1C: filterByTempProbe1C,
            filterByTempProbe1F: filterByTempProbe1F,
            filterByTempProbe2C: filterByTempProbe2C,
            filterByTempProbe2F: filterByTempProbe2F,
            filterByLight: filterByLight,
            filterByHumidity: filterByHumidity,
            filterByShock: filterByShock,
            filterByPressure: filterByPressure,
            filterByTilt: filterByTilt,
            save: save
        };
        return service;

        function filter(report) {
            var isSeverityMatch = service.showWarning && report.severity === 'warning' ||
                service.showInfo && report.severity === 'info' ||
                service.showOk && report.severity === 'ok';

            var isTextMatch = true;
            if (service.searchText) {
                var lowerCaseSearchText = service.searchText.toLowerCase();
                isTextMatch = (
                    report.shipment.deviceTagId.toLowerCase().indexOf(lowerCaseSearchText) > -1 ||
                    //report.deviceName.toLowerCase().indexOf(lowerCaseSearchText) > -1 ||
                    _.findIndex(report.alarms, function (alarm) { return alarm.groupName.toLowerCase().indexOf(lowerCaseSearchText) > -1; }) > -1
                );
            }

            var isRangeMatch = service.range.filterOption === 'none' ? true : isAbove(report) || isBelow(report) || isBetween(report) || isOutside(report);

            return (isTextMatch && isSeverityMatch && isRangeMatch);
        }

        function filterByBattery() {
            service.filterByPropertyName = 'Battery (%)';
            service.range.property = 'batteryPercent';
            service.range.min = 0;
            service.range.max = 100;
            service.range.above = service.range.min;
            service.range.below = service.range.max;
            service.range.from = service.range.min;
            service.range.to = service.range.max;
            service.range.filterOption = 'none';
            service.range.suffix = '%';
        }

        function filterByHumidity() {
            service.filterByPropertyName = 'Humidity (%)';
            service.range.property = 'humidity';
            service.range.min = 0;
            service.range.max = 100;
            service.range.above = service.range.min;
            service.range.below = service.range.max;
            service.range.from = service.range.min;
            service.range.to = service.range.max;
            service.range.filterOption = 'none';
            service.range.suffix = '%';
        }

        function filterByTemperatureC() {
            service.filterByPropertyName = 'Temperature (\xB0C)';
            service.range.property = 'temperatureC';
            service.range.min = -255;
            service.range.max = 255;
            service.range.above = service.range.min;
            service.range.below = service.range.max;
            service.range.from = service.range.min;
            service.range.to = service.range.max;
            service.range.filterOption = 'none';
            service.range.suffix = '\xB0C';
        }

        // function filterByTempProbeC() {
        //     service.filterByPropertyName = 'Temp. Probe (\xB0C)';
        //     service.range.property = 'temperatureProbeC';
        //     service.range.min = -255;
        //     service.range.max = 255;
        //     service.range.above = service.range.min;
        //     service.range.below = service.range.max;
        //     service.range.from = service.range.min;
        //     service.range.to = service.range.max;
        //     service.range.suffix = '\xB0C';
        //     service.range.filterOption = 'none';
        // }

        function filterByTempProbe1C() {
            service.filterByPropertyName = 'Temp. Probe 1 (\xB0C)';
            service.range.property = 'temperatureProbe1C';
            service.range.min = -255;
            service.range.max = 255;
            service.range.above = service.range.min;
            service.range.below = service.range.max;
            service.range.from = service.range.min;
            service.range.to = service.range.max;
            service.range.suffix = '\xB0C';
            service.range.filterOption = 'none';
        }
        function filterByTempProbe2C() {
            service.filterByPropertyName = 'Temp. Probe 2 (\xB0C)';
            service.range.property = 'temperatureProbe2C';
            service.range.min = -255;
            service.range.max = 255;
            service.range.above = service.range.min;
            service.range.below = service.range.max;
            service.range.from = service.range.min;
            service.range.to = service.range.max;
            service.range.suffix = '\xB0C';
            service.range.filterOption = 'none';
        }
        function filterByTemperatureF() {
            service.filterByPropertyName = 'Temperature (\xB0F)';
            service.range.property = 'temperatureF';
            service.range.min = -255;
            service.range.max = 255;
            service.range.above = service.range.min;
            service.range.below = service.range.max;
            service.range.from = service.range.min;
            service.range.to = service.range.max;
            service.range.filterOption = 'none';
            service.range.suffix = '\xB0F';
        }

        // function filterByTempProbeF() {
        //     service.filterByPropertyName = 'Temp. Probe (\xB0F)';
        //     service.range.property = 'temperatureProbeF';
        //     service.range.min = -255;
        //     service.range.max = 255;
        //     service.range.above = service.range.min;
        //     service.range.below = service.range.max;
        //     service.range.from = service.range.min;
        //     service.range.to = service.range.max;
        //     service.range.suffix = '\xB0F';
        //     service.range.filterOption = 'none';
        // }
        function filterByTempProbe1F() {
            service.filterByPropertyName = 'Temp. Probe 1 (\xB0F)';
            service.range.property = 'temperatureProbe1F';
            service.range.min = -255;
            service.range.max = 255;
            service.range.above = service.range.min;
            service.range.below = service.range.max;
            service.range.from = service.range.min;
            service.range.to = service.range.max;
            service.range.suffix = '\xB0F';
            service.range.filterOption = 'none';
        }
 
        function filterByTempProbe2F() {
            service.filterByPropertyName = 'Temp. Probe 2 (\xB0F)';
            service.range.property = 'temperatureProbe2F';
            service.range.min = -255;
            service.range.max = 255;
            service.range.above = service.range.min;
            service.range.below = service.range.max;
            service.range.from = service.range.min;
            service.range.to = service.range.max;
            service.range.suffix = '\xB0F';
            service.range.filterOption = 'none';
        }
        function filterByPressure() {
            service.filterByPropertyName = 'Pressure (kPa)';
            service.range.property = 'pressure';
            service.range.min = 30;  //TODO: fix
            service.range.max = 110; //TODO: fix
            service.range.above = service.range.min;
            service.range.below = service.range.max;
            service.range.from = service.range.min;
            service.range.to = service.range.max;
            service.range.suffix = 'kPa';
            service.range.filterOption = 'none';
        }

        function filterByLight() {
            service.filterByPropertyName = 'Light (lux)';
            service.range.property = 'light';
            service.range.min = 0;
            service.range.max = 188000;  //TODO: how to handle big number?
            service.range.above = service.range.min;
            service.range.below = service.range.max;
            service.range.from = service.range.min;
            service.range.to = service.range.max;
            service.range.suffix = 'lux';
            service.range.filterOption = 'none';
        }

        function filterByShock() {
            service.filterByPropertyName = 'Shock (g)';
            service.range.property = 'shockMagnitude';
            service.range.min = 0;
            service.range.max = 25;
            service.range.above = service.range.min;
            service.range.below = service.range.max;
            service.range.from = service.range.min;
            service.range.to = service.range.max;
            service.range.suffix = 'g';
            service.range.filterOption = 'none';
        }
        function filterByTilt() {
            service.filterByPropertyName = 'Tilt (\xB0)';
            service.range.property = 'tiltMagnitude';
            service.range.min = 0;
            service.range.max = 90;
            service.range.above = service.range.min;
            service.range.below = service.range.max;
            service.range.from = service.range.min;
            service.range.to = service.range.max;
            service.range.suffix = '\xB0';
            service.range.filterOption = 'none';
        }
        function isAbove(report) {
            return service.range.filterOption === 'above' && report[service.range.property] > service.range.above;
        }

        function isBelow(report) {
            return service.range.filterOption === 'below' && report[service.range.property] < service.range.below;
        }

        function isBetween(report) {
            return service.range.filterOption === 'between' && (report[service.range.property] >= service.range.from && report[service.range.property] <= service.range.to);
        }

        function isOutside(report) {
            return service.range.filterOption === 'outside' && !(report[service.range.property] >= service.range.from && report[service.range.property] <= service.range.to);
        }

        function save() {
            var filterSettings = {
                showOk: service.showOk,
                showInfo: service.showInfo,
                showWarning: service.showWarning,
                filterByPropertyName: service.filterByPropertyName,
                range: service.range
            };
            localStorageService.set(localStorageKey, filterSettings);
        }
    }
})();