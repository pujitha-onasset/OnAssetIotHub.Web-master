(function () {
    'use strict';

    angular
        .module('tracking.ui.shipments')
        .factory('ShipmentsFilterService', ShipmentsFilterService);

    ShipmentsFilterService.$inject = ['localStorageService'];
    function ShipmentsFilterService(localStorageService) {

        var service = {
            isAbove: isAbove,
            isBelow: isBelow,
            isBetween: isBetween,
            isOutside: isOutside,
            status: 'All',
            filterByPropertyName: 'Battery',
            range: {
                property: 'batteryPercent',
                min: 0,
                max: 100,
                above: 0,
                below: 100,
                from: 0,
                to: 100,
                filterOption: 'none',
                suffix: '%'
            },
            filter: filter,
            filterByBattery: filterByBattery,
            filterByTemperatureC: filterByTemperatureC,
            filterByTemperatureF: filterByTemperatureF,
            filterByTempProbeC: filterByTempProbeC,
            filterByTempProbeF: filterByTempProbeF,
            filterByLight: filterByLight,
            filterByHumidity: filterByHumidity,
            filterByShock: filterByShock,
            filterByPressure: filterByPressure,
            save: save
        };
        return service;

        function filter(shipment) {
            var isRangeMatch = service.range.filterOption === 'none' ? true : isAbove(shipment.latestReport) || isBelow(shipment.latestReport) || isBetween(shipment.latestReport) || isOutside(shipment.latestReport);

            var statusMatch = true;
            var shipmentStatus = shipment.shipmentInfo.status.toLowerCase();
            switch (service.status.toLowerCase()) {
                case 'active':
                    statusMatch = shipmentStatus === 'active';
                    break;
                case 'pending':
                    statusMatch = shipmentStatus === 'pending';
                    break;
                case 'overdue':
                    statusMatch = shipmentStatus === 'overdue';
                    break;
                case 'complete':
                    statusMatch = shipmentStatus === 'complete';
                    break;
                default:
                    statusMatch = true;
            }

            return isRangeMatch && statusMatch;
        }

        function filterByBattery() {
            service.filterByPropertyName = 'Battery';
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
            service.filterByPropertyName = 'Humidity';
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
            service.filterByPropertyName = 'Temperature';
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

        function filterByTempProbeC() {
            service.filterByPropertyName = 'Temp. Probe';
            service.range.property = 'temperatureProbeC';
            service.range.min = -255;
            service.range.max = 255;
            service.range.above = service.range.min;
            service.range.below = service.range.max;
            service.range.from = service.range.min;
            service.range.to = service.range.max;
            service.range.filterOption = 'none';
            service.range.suffix = '\xB0C';
        }

        function filterByTemperatureF() {
            service.filterByPropertyName = 'Temperature';
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

        function filterByTempProbeF() {
            service.filterByPropertyName = 'Temp. Probe';
            service.range.property = 'temperatureProbeF';
            service.range.min = -255;
            service.range.max = 255;
            service.range.above = service.range.min;
            service.range.below = service.range.max;
            service.range.from = service.range.min;
            service.range.to = service.range.max;
            service.range.filterOption = 'none';
            service.range.suffix = '\xB0F';
        }

        function filterByPressure() {
            service.filterByPropertyName = 'Pressure';
            service.range.property = 'pressure';
            service.range.min = 30;  //TODO: fix
            service.range.max = 110; //TODO: fix
            service.range.above = service.range.min;
            service.range.below = service.range.max;
            service.range.from = service.range.min;
            service.range.to = service.range.max;
            service.range.filterOption = 'none';
            service.range.suffix = ' kPa';
        }

        function filterByLight() {
            service.filterByPropertyName = 'Light';
            service.range.property = 'light';
            service.range.min = 0;
            service.range.max = 188000;  //TODO: how to handle big number?
            service.range.above = service.range.min;
            service.range.below = service.range.max;
            service.range.from = service.range.min;
            service.range.to = service.range.max;
            service.range.filterOption = 'none';
            service.range.suffix = ' lux';
        }

        function filterByShock() {
            service.filterByPropertyName = 'Shock';
            service.range.property = 'shockMagnitude';
            service.range.min = 0;
            service.range.max = 25;
            service.range.above = service.range.min;
            service.range.below = service.range.max;
            service.range.from = service.range.min;
            service.range.to = service.range.max;
            service.range.filterOption = 'none';
            service.range.suffix = ' g';
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
                searchText: service.searchText,
                filterByPropertyName: service.filterByPropertyName,
                range: service.range
            };
            localStorageService.set('shipmentsFilterService', filterSettings);
        }
    }
})();