(function () {
    'use strict';

    angular
        .module('ui-sentinel.calibrations.calibrationControlCenter')
        .factory('CalibrationControlCenterFilterService', CalibrationControlCenterFilterService);

    CalibrationControlCenterFilterService.$inject = ['localStorageService'];
    function CalibrationControlCenterFilterService(localStorageService) {
        var localStorageKey = null;//'CalibrationControlCenterFilterServiceV2';
        var filterSettings = localStorageService.get(localStorageKey);

        var service = {
            searchText: filterSettings ? filterSettings.searchText : null,
            showOk: filterSettings ? filterSettings.showOk : true,
            showInfo: filterSettings ? filterSettings.showInfo : true,
            showWarning: filterSettings ? filterSettings.showWarning : true,
            toggleSeverity: toggleSeverity,
            filter: filter,
            reports: {
                showOk: filterSettings ? filterSettings.reports.showOk : true,
                showInfo: filterSettings ? filterSettings.reports.showInfo : true,
                showWarning: filterSettings ? filterSettings.reports.showWarning : true,
                isAbove: isAbove,
                isBelow: isBelow,
                isBetween: isBetween,
                isOutside: isOutside,
                filterByPropertyName: filterSettings ? filterSettings.reports.filterByPropertyName : 'Battery ',
                range: {
                    property: filterSettings ? filterSettings.reports.range.property : 'batteryPercent',
                    min: filterSettings ? filterSettings.reports.range.min : 0,
                    max: filterSettings ? filterSettings.reports.range.max : 100,
                    above: filterSettings ? filterSettings.reports.range.above : 0,
                    below: filterSettings ? filterSettings.reports.range.below : 100,
                    from: filterSettings ? filterSettings.reports.range.from : 0,
                    to: filterSettings ? filterSettings.reports.range.to : 100,
                    filterOption: filterSettings ? filterSettings.reports.range.filterOption : 'none',
                    suffix: filterSettings ? filterSettings.reports.range.suffix : '%'
                },
                filterByBattery: filterByBattery,
                filterByTemperatureC: filterByTemperatureC,
                filterByTemperatureF: filterByTemperatureF,
                filterByTempProbeC: filterByTempProbeC,
                filterByTempProbeF: filterByTempProbeF,
                filterByLight: filterByLight,
                filterByHumidity: filterByHumidity,
                filterByShock: filterByShock,
                filterByPressure: filterByPressure
            },
            save: save
        };
        return service;

        function toggleSeverity(severity) {
            switch (severity) {
                case 'ok':
                    service.showOk = !service.showOk;
                    break;
                case 'info':
                    service.showInfo = !service.showInfo;
                    break;
                case 'warning':
                    service.showWarning = !service.showWarning;
                    break;
            }
            $('#btn-' + severity).blur();
        }

        function filter(report) {
            var isTextMatch = true;
            if (service.searchText) {
                isTextMatch = (
                    report.assetName.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    report.sentinelId.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    (report.manufacturer !== null && report.manufacturer.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1)
                );
       
            }
            

            var isSeverityMatch = service.showWarning && report.severity === 'warning' ||
                service.showInfo && report.severity === 'info' ||
                service.showOk && report.severity === 'ok';

            return isTextMatch && isSeverityMatch;
        }

        function filterByBattery() {
            service.reports.filterByPropertyName = 'Battery';
            service.reports.range.property = 'batteryPercent';
            service.reports.range.min = 0;
            service.reports.range.max = 100;
            service.reports.range.above = service.reports.range.min;
            service.reports.range.below = service.reports.range.max;
            service.reports.range.from = service.reports.range.min;
            service.reports.range.to = service.reports.range.max;
            service.reports.range.filterOption = 'none';
            service.reports.range.suffix = '%';
        }

        function filterByHumidity() {
            service.reports.filterByPropertyName = 'Humidity';
            service.reports.range.property = 'humidity';
            service.reports.range.min = 0;
            service.reports.range.max = 100;
            service.reports.range.above = service.reports.range.min;
            service.reports.range.below = service.reports.range.max;
            service.reports.range.from = service.reports.range.min;
            service.reports.range.to = service.reports.range.max;
            service.reports.range.filterOption = 'none';
            service.reports.range.suffix = '%';
        }

        function filterByTemperatureC() {
            service.reports.filterByPropertyName = 'Temperature';
            service.reports.range.property = 'temperatureC';
            service.reports.range.min = -255;
            service.reports.range.max = 255;
            service.reports.range.above = service.reports.range.min;
            service.reports.range.below = service.reports.range.max;
            service.reports.range.from = service.reports.range.min;
            service.reports.range.to = service.reports.range.max;
            service.reports.range.filterOption = 'none';
            service.reports.range.suffix = '\xB0C';
        }

        function filterByTempProbeC() {
            service.reports.filterByPropertyName = 'Temp. Probe';
            service.reports.range.property = 'temperatureProbeC';
            service.reports.range.min = -255;
            service.reports.range.max = 255;
            service.reports.range.above = service.reports.range.min;
            service.reports.range.below = service.reports.range.max;
            service.reports.range.from = service.reports.range.min;
            service.reports.range.to = service.reports.range.max;
            service.reports.range.filterOption = 'none';
            service.reports.range.suffix = '\xB0C';
        }

        function filterByTemperatureF() {
            service.reports.filterByPropertyName = 'Temperature ';
            service.reports.range.property = 'temperatureF';
            service.reports.range.min = -255;
            service.reports.range.max = 255;
            service.reports.range.above = service.reports.range.min;
            service.reports.range.below = service.reports.range.max;
            service.reports.range.from = service.reports.range.min;
            service.reports.range.to = service.reports.range.max;
            service.reports.range.filterOption = 'none';
            service.reports.range.suffix = '\xB0F';
        }

        function filterByTempProbeF() {
            service.reports.filterByPropertyName = 'Temp. Probe';
            service.reports.range.property = 'temperatureProbeF';
            service.reports.range.min = -255;
            service.reports.range.max = 255;
            service.reports.range.above = service.reports.range.min;
            service.reports.range.below = service.reports.range.max;
            service.reports.range.from = service.reports.range.min;
            service.reports.range.to = service.reports.range.max;
            service.reports.range.filterOption = 'none';
            service.reports.range.suffix = '\xB0F';
        }

        function filterByPressure() {
            service.reports.filterByPropertyName = 'Pressure';
            service.reports.range.property = 'pressure';
            service.reports.range.min = 30;  //TODO: fix
            service.reports.range.max = 110; //TODO: fix
            service.reports.range.above = service.reports.range.min;
            service.reports.range.below = service.reports.range.max;
            service.reports.range.from = service.reports.range.min;
            service.reports.range.to = service.reports.range.max;
            service.reports.range.filterOption = 'none';
            service.reports.range.suffix = 'kPa';
        }

        function filterByLight() {
            service.reports.filterByPropertyName = 'Light';
            service.reports.range.property = 'light';
            service.reports.range.min = 0;
            service.reports.range.max = 188000;  //TODO: how to handle big number?
            service.reports.range.above = service.reports.range.min;
            service.reports.range.below = service.reports.range.max;
            service.reports.range.from = service.reports.range.min;
            service.reports.range.to = service.reports.range.max;
            service.reports.range.filterOption = 'none';
            service.reports.range.suffix = 'lux';
        }

        function filterByShock() {
            service.reports.filterByPropertyName = 'Shock';
            service.reports.range.property = 'shockMagnitude';
            service.reports.range.min = 0;
            service.reports.range.max = 25;
            service.reports.range.above = service.reports.range.min;
            service.reports.range.below = service.reports.range.max;
            service.reports.range.from = service.reports.range.min;
            service.reports.range.to = service.reports.range.max;
            service.reports.range.filterOption = 'none';
            service.reports.range.suffix = 'g';
        }


        
        function isAbove(report) {
            return service.reports.range.filterOption === 'above' && report[service.reports.range.property] > service.reports.range.above;
        }

        function isBelow(report) {
            return service.reports.range.filterOption === 'below' && report[service.reports.range.property] < service.reports.range.below;
        }

        function isBetween(report) {
            return service.reports.range.filterOption === 'between' && (report[service.reports.range.property] >= service.reports.range.from && report[service.reports.range.property] <= service.reports.range.to);
        }

        function isOutside(report) {
            return service.reports.range.filterOption === 'outside' && !(report[service.reports.range.property] >= service.reports.range.from && report[service.reports.range.property] <= service.reports.range.to);
        }
        function save() {
            filterSettings = {
                searchText: service.searchText,
                showOk: service.showOk,
                showInfo: service.showInfo,
                showWarning: service.showWarning,
                reports: {
                    showOk: service.reports.showOk,
                    showInfo: service.reports.showInfo,
                    showWarning: service.reports.showWarning,
                    filterByPropertyName: service.reports.filterByPropertyName,
                    range: service.reports.range
                }
            };
            localStorageService.set(localStorageKey, filterSettings);
        }
    }
})();