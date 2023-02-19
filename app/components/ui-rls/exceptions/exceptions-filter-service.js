(function () {
    'use strict';

    angular
        .module('ui-rls.exceptions')
        .factory('ExceptionsFilterService', ExceptionsFilterService);

    ExceptionsFilterService.$inject = [];
    function ExceptionsFilterService() {

        var service = {
            searchText: null,
            filter: filter
        };
        return service;

        function filter(device) {
            var isTextMatch = true;
            if (service.searchText) {
                isTextMatch = (
                    device.deviceId.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    device.shipmentRefNumber.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    (device.shipmentEndDate !== null && device.shipmentEndDate.toString().toLowerCase().indexOf(service.searchText.toLowerCase()) > -1) ||
                    (device.lastReportTimestamp !== null && device.lastReportTimestamp.toString().toLowerCase().indexOf(service.searchText.toLowerCase()) > -1) ||
                    (device.lastReportLatitude !== null && device.lastReportLatitude.toString().toLowerCase().indexOf(service.searchText.toLowerCase()) > -1) ||
                    (device.lastReportLongitude !== null && device.lastReportLongitude.toString().toLowerCase().indexOf(service.searchText.toLowerCase()) > -1)
                );
            }

            return isTextMatch;
        }
    }

})();
