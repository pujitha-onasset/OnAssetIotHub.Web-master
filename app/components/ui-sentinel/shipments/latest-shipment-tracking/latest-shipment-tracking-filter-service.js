(function () {
    'use strict';

    angular
        .module('ui-sentinel.shipments.latestShipmentTracking')
        .factory('LatestShipmentTrackingFilterService', LatestShipmentTrackingFilterService);

    LatestShipmentTrackingFilterService.$inject = ['localStorageService'];
    function LatestShipmentTrackingFilterService(localStorageService) {
        var localStorageKey = 'latestShipmentTrackingFilterServicev2';
        var filterSettings = localStorageService.get(localStorageKey);
        
        var service = {
            searchText: filterSettings ? filterSettings.searchText : null,
            shipments: {
                filter: filterShipments,
                status: filterSettings ? filterSettings.shipments.status : 'All',
                origin: filterSettings ? filterSettings.shipments.origin : null,
                destination: filterSettings ? filterSettings.shipments.destination : null
            },
            reports: {
                showOk: filterSettings ? filterSettings.reports.showOk : true,
                showInfo: filterSettings ? filterSettings.reports.showInfo : true,
                showWarning: filterSettings ? filterSettings.reports.showWarning : true,
                isAbove: isAbove,
                isBelow: isBelow,
                isBetween: isBetween,
                isOutside: isOutside,
                filterByPropertyName: filterSettings ? filterSettings.reports.filterByPropertyName : 'Battery',
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
                filter: filterReports,
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
                filterByTilt: filterByTilt
            },
            save: save
        };
        return service;

        function filterShipments(shipment) {
            var isTextMatch = true;
            if (service.searchText) {
                isTextMatch = (
                    shipment.deviceTagId.toLowerCase().indexOf(service.searchText.toString().toLowerCase()) > -1 ||
                    shipment.referenceNumber.toLowerCase().indexOf(service.searchText.toString().toLowerCase()) > -1
                );
            }

            var isOriginMatch = true;
            if (service.shipments.origin) {
                isOriginMatch = shipment.origin.toLowerCase().indexOf(service.shipments.origin.toString().toLowerCase()) > -1;
            }

            var isDestinationMatch = true;
            if (service.shipments.destination) {
                isDestinationMatch = shipment.destination.toLowerCase().indexOf(service.shipments.destination.toString().toLowerCase()) > -1;
            }

            var statusMatch = true;
            var shipmentStatus = shipment.status.toLowerCase();
            switch (service.shipments.status.toLowerCase()) {
                case 'active':
                    statusMatch = shipmentStatus === 'pending' || shipmentStatus === 'active' || shipmentStatus === 'overdue';
                    break;
                case 'pending':
                    statusMatch = shipmentStatus === 'pending';
                    break;
                case 'in-transit':
                    statusMatch = shipmentStatus === 'active';
                    break;
                case 'overdue':
                    statusMatch = shipmentStatus === 'overdue';
                    break;
                case 'expired':
                    statusMatch = shipmentStatus === 'expired';
                    break;
                case 'cancelled':
                    statusMatch = shipmentStatus === 'cancelled';
                    break;
                case 'complete':
                    statusMatch = shipmentStatus === 'complete';
                    break;
                default:
                    statusMatch = true;
            }

            return isTextMatch && isOriginMatch && isDestinationMatch && statusMatch;
        }

        function filterReports(report) {
            var isSeverityMatch = service.reports.showWarning && report.severity === 'warning' ||
                service.reports.showInfo && report.severity === 'info' ||
                service.reports.showOk && report.severity === 'ok';

            var isTextMatch = true;
            if (service.searchText) {
                var lowerCaseSearchText = service.searchText.toLowerCase();
                isTextMatch = (
                    report.shipment.deviceTagId.toLowerCase().indexOf(lowerCaseSearchText) > -1 ||
                    //report.deviceName.toLowerCase().indexOf(lowerCaseSearchText) > -1 ||
                    report.shipment.referenceNumber.toLowerCase().indexOf(lowerCaseSearchText) > -1 ||
                    _.findIndex(report.alarms, function (alarm) { return alarm.groupName.toLowerCase().indexOf(lowerCaseSearchText) > -1; }) > -1
                );
            }

            /*var isOriginMatch = true;
            if (service.shipments.origin) {
                isOriginMatch = report.shipment.origin.toLowerCase().indexOf(service.shipments.origin.toString().toLowerCase()) > -1;
            }

            var isDestinationMatch = true;
            if (service.shipments.destination) {
                isDestinationMatch = report.shipment.destination.toLowerCase().indexOf(service.shipments.destination.toString().toLowerCase()) > -1;
            }*/

            var isRangeMatch = service.reports.range.filterOption === 'none' ? true : isAbove(report) || isBelow(report) || isBetween(report) || isOutside(report);

            var statusMatch = true;
            var shipmentStatus = report.shipment.status.toLowerCase();
            switch (service.shipments.status.toLowerCase()) {
                case 'active':
                    statusMatch = /*shipmentStatus === 'pending' ||*/ shipmentStatus === 'active' || shipmentStatus === 'overdue';
                    break;
                case 'pending':
                    statusMatch = shipmentStatus === 'pending';
                    break;
                case 'in-transit':
                    statusMatch = shipmentStatus === 'active';
                    break;
                case 'overdue':
                    statusMatch = shipmentStatus === 'overdue';
                    break;
                case 'expired':
                    statusMatch = shipmentStatus === 'expired';
                    break;
                case 'cancelled':
                    statusMatch = shipmentStatus === 'cancelled';
                    break;
                case 'complete':
                    statusMatch = shipmentStatus === 'complete';
                    break;
                default:
                    statusMatch = true;
            }

            return isTextMatch && isSeverityMatch && isRangeMatch && /*isOriginMatch && isDestinationMatch &&*/ statusMatch;
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

        function filterByTempProbe1C() {
            service.reports.filterByPropertyName = 'Temp. Probe 1';
            service.reports.range.property = 'temperatureProbe1C';
            service.reports.range.min = -255;
            service.reports.range.max = 255;
            service.reports.range.above = service.reports.range.min;
            service.reports.range.below = service.reports.range.max;
            service.reports.range.from = service.reports.range.min;
            service.reports.range.to = service.reports.range.max;
            service.reports.range.filterOption = 'none';
            service.reports.range.suffix = '\xB0C';
        }

        function filterByTempProbe2C() {
            service.reports.filterByPropertyName = 'Temp. Probe 2';
            service.reports.range.property = 'temperatureProbe2C';
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

        function filterByTempProbe1F() {
            service.reports.filterByPropertyName = 'Temp. Probe 1';
            service.reports.range.property = 'temperatureProbe1F';
            service.reports.range.min = -255;
            service.reports.range.max = 255;
            service.reports.range.above = service.reports.range.min;
            service.reports.range.below = service.reports.range.max;
            service.reports.range.from = service.reports.range.min;
            service.reports.range.to = service.reports.range.max;
            service.reports.range.filterOption = 'none';
            service.reports.range.suffix = '\xB0F';
        }

        
        function filterByTempProbe2F() {
            service.reports.filterByPropertyName = 'Temp. Probe 2';
            service.reports.range.property = 'temperatureProbe2F';
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

        function filterByTilt() {
            service.reports.filterByPropertyName = 'Tilt';
            service.reports.range.property = 'tiltMagnitude';
            service.reports.range.min = 0;
            service.reports.range.max = 90;
            service.reports.range.above = service.reports.range.min;
            service.reports.range.below = service.reports.range.max;
            service.reports.range.from = service.reports.range.min;
            service.reports.range.to = service.reports.range.max;
            //changes required
            service.reports.range.suffix = ' \xB0';
            service.reports.range.filterOption = 'none';
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
                shipments: {
                    status: service.shipments.status,
                    origin: service.shipments.origin,
                    destination: service.shipments.destination
                },
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