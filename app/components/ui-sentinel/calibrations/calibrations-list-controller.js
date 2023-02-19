(function() {
    'use strict';

    angular
        .module('ui-sentinel.assets')
        .controller('CalibrationListController', CalibrationListController);

    CalibrationListController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'SentinelUiSession', 'CalibrationsDataService', 'CalibrationService', 'CalibrationsFilterService', 'FeedbackService'];
    function CalibrationListController($rootScope, $scope, $state, $stateParams, SentinelUiSession, CalibrationsDataService, CalibrationService, CalibrationsFilterService, FeedbackService) {
        var vm = {
            list: null,
            feedback: FeedbackService,
            hasPermission: {
                toAdd: false,
                toEdit: false,
                toRemove: false,
            },
            goToAddCalibration: goToAddCalibration,
            goToEditCalibration: goToEditCalibration,
            calibration: null,
            deleteInProgress: false,
            deleteBegin: deleteBegin,
            deleteCancel: deleteCancel,
            deleteSubmit: deleteSubmit,
        };

        var genericDeleteErrorMessage = "Unexpected error ocurred while deleting a watchlist";
        activate();
        return vm;

        function activate() {
            vm.feedback.clear();
            setPermissions();
            load();
        }

        function load() {
            $('.modal').modal('hide');
            $rootScope.loading = true;

            var listPromise = CalibrationService.getCalibrations($stateParams.sentinelId).$promise;
            listPromise.then(
                function(result) {
                    console.log(result);
                    vm.list = result;
                }, function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function setPermissions() {
            vm.hasPermission.toEdit =
                SentinelUiSession.user.isSystemAdmin || SentinelUiSession.user.isAccountAdmin;

            vm.hasPermission.toRemove =
                SentinelUiSession.user.isSystemAdmin || SentinelUiSession.user.isAccountAdmin;

            vm.hasPermission.toAdd =
                SentinelUiSession.user.isSystemAdmin || SentinelUiSession.user.isAccountAdmin;
        }

        function goToAddCalibration(asset) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('calibrations.new', { sentinelId: asset.sentinelId, referrer: returnState, referrerParams: returnStateParams, asset: asset } );
        }

        function goToEditCalibration(calibration) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('calibration.admin', { calibrationId: calibration.assetCalibrationId, referrer: returnState, referrerParams: returnStateParams, calibration: calibration } );
        }

        function deleteBegin(calibration) {
            vm.deleteInProgress = true;
            vm.calibration = calibration;
            vm.deleteErrorMessage = null;
        }

        function deleteCancel() {
            vm.deleteErrorMessage = null;
            vm.deleteInProgress = false;
        }

        function deleteSubmit() {
            $rootScope.loading = true;
            vm.deleteErrorMessage = null;

            var promise = CalibrationService.removeCalibration(vm.calibration.assetCalibrationId).$promise;

            promise.then(
                function (result) {
                    load();
                },
                function (error) {
                    console.log(error);
                    vm.deleteErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericDeleteErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }
    }
})();

