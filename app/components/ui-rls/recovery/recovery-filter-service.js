(function () {
    'use strict';

    angular
        .module('ui-rls.recovery')
        .factory('RecoveryFilterService', RecoveryFilterService);

    RecoveryFilterService.$inject = [];
    function RecoveryFilterService() {

        var service = {
            searchText: null,
            filter: filter
        };
        return service;

        function filter(device) {
            var isTextMatch = true;
            if (service.searchText) {
                isTextMatch = (
                    device.clientId.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    device.deviceId.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    device.shipmentRefNumber.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    (device.lastReportTimestamp !== null && device.lastReportTimestamp.toString().toLowerCase().indexOf(service.searchText.toLowerCase()) > -1) ||
                    device.homebranchId.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    (device.homebranchName !== null && device.homebranchName.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1) ||
                    (device.recoveryAcknowledgement !== null && device.recoveryAcknowledgement.toString().toLowerCase().indexOf(service.searchText.toLowerCase()) > -1) ||
                    (device.recoveryUser !== null && device.recoveryUser.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1)
                );
            }

            return isTextMatch;
        }
    }

})();
