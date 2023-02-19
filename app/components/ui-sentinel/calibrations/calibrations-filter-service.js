(function () {
    'use strict';

    angular
        .module('ui-sentinel.calibrations')
        .factory('CalibrationsFilterService', CalibrationsFilterService);

    CalibrationsFilterService.$inject = [];
    function CalibrationsFilterService() {

        var service = {
            searchText: null,
            filter: filter
        };
        return service;

        function filter(calibration) {
            var isTextMatch = true;
            if (service.searchText) {
                isTextMatch = (
                    calibration.assetCalibrationId.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    calibration.sentinelAssignmentId.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    (calibration.primarySupplierName !== null && calibration.primarySupplierName.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1) ||
                    (calibration.primarySupplierAdress !== null && calibration.primarySupplierAdress.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1) ||
                    (calibration.productLine !== null && calibration.productLine.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1) ||
                    (calibration.manufacturerOfOrigin !== null && calibration.manufacturerOfOrigin.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1) ||
                    (calibration.specialInstructions !== null && calibration.specialInstructions.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1)
                );
            }

            return isTextMatch;
        }
    }

})();