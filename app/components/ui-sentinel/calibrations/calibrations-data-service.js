(function () {
    'use strict';

    angular
        .module('ui-sentinel.calibrations')
        .factory('CalibrationsDataService', CalibrationsDataService);

    CalibrationsDataService.$inject = ['$rootScope', 'SentinelUiSession',  'FeedbackService','CalibrationService'];
    function CalibrationsDataService( $rootScope, SentinelUiSession, FeedbackService, CalibrationService) {
        var service = {
            all: [],
            feedback: FeedbackService,
            load: load
        };
        activate();
        return service;
        
        ////////////////////////
        
        function activate() {
            load();
        }

        function load() {
            /*service.all = [];
            $rootScope.loading = true;

            var calibrationPromise = CalibrationService.getCalibrations(SentinelUiSession.focus).$promise;
            calibrationPromise.then(
                function(result) {
                    $rootScope.loading = false;
                    service.all = result;
                },
                function (error) {
                    $rootScope.loading = false;
                    service.feedback.addError(error.data.message);
                }
            );*/
        }
    }
})();