(function() {
    'use strict';

    angular
        .module('ui-rls.exceptions')
        .controller('ExceptionsListController', ExceptionsListController);

    ExceptionsListController.$inject = ['$rootScope', '$scope', '$state', 'RlsUiSession', 'ExceptionsDataService', 'ExceptionsFilterService', 'FeedbackService', 'DeviceRecoveryService','localStorageService','VisionApiUsersService','ShipmentsService'];
    function ExceptionsListController($rootScope, $scope, $state, RlsUiSession, ExceptionsDataService, ExceptionsFilterService, FeedbackService, DeviceRecoveryService,localStorageService,VisionApiUsersService,ShipmentsService) {
        var vm = {
            exceptions: ExceptionsDataService,
            filterService: ExceptionsFilterService,
            feedback: FeedbackService,
            propertyName: 'clientId',
            reverse: false,
            sortBy: sortBy,
            completeException: null,
            completeInProgress: false,
            completeShipmentException: null,
            completeShipmentInProgress: false,
            completeBegin: completeBegin,
            completeCancel: completeCancel,
            completeSubmit: completeSubmit,
            completeShipmentBegin: completeShipmentBegin,
            completeShipmentCancel: completeShipmentCancel,
            completeShipmentSubmit: completeShipmentSubmit,
            hasPermission: {
                toComplete: false,
                toCompleteShipment: false
            },
            setPermissions: setPermissions,
            validateDateRange: validateDateRange,
            goToRecoveryDevice: goToRecoveryDevice,
        };
        var genericRemoveErrorMessage = "Unexpected error ocurred while removing the device from exceptions list";
        activate();
        return vm;

        function activate() {
            $('.modal').modal('hide');
            vm.feedback.clear();
            setPermissions();

            
            load();
        }

        function load() {
            vm.exceptions.load();
        }

        function sortBy(propertyName) {
            vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
        }

        function completeBegin(device) {
            vm.completeInProgress = true;
            vm.completeException = device;
            vm.completeErrorMessage = null;
        }

        function completeShipmentBegin(device) {
            vm.completeShipmentInProgress = true;
            vm.completeShipmentException = device;
            vm.completeShipmentErrorMessage = null;
        }
        
        function completeCancel() {
            vm.completeErrorMessage = null;
            vm.completeInProgress = false;
            vm.completeException = null;
        }

        function completeShipmentCancel() {
            vm.completeShipmentErrorMessage = null;
            vm.completeShipmentInProgress = false;
            vm.completeShipmentException = null;
        }
        
        function completeSubmit() {
            if (!vm.completeException || !vm.completeException.id ) {
                return;
            }
            $rootScope.loading = true;
            vm.completeErrorMessage = null;

            var promise = DeviceRecoveryService.updateCompleteDeviceRecovery(RlsUiSession.focus, vm.completeException.id).$promise;
            promise.then(
                function(result) {
                    load();
                    completeCancel();
                    $('.modal').modal('hide');
                },
                function (error) {
                    console.log(error);
                    vm.completeErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericRemoveErrorMessage;
                    vm.feedback.addError(vm.completeErrorMessage);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function completeShipmentSubmit() {
            if (!vm.completeShipmentException || !vm.completeShipmentException.id ) {
                return;
            }
            $rootScope.loading = true;
            vm.completeShipmentErrorMessage = null;
            var promise= null;
            if (localStorageService.get('visionToken') && typeof localStorageService.get('visionToken') !== "undefined") {
                promise = VisionApiUsersService.completeShipment(vm.completeShipmentException.shipmentId).$promise;
            }else{
                promise = ShipmentsService.completeShipment(vm.completeShipmentException.shipmentId).$promise;
            }

            
            promise.then(
                function(result) {
                    load();
                    completeShipmentCancel();
                    $('.modal').modal('hide');
                    $('#completeShipmentModalConfirm').modal('show');
                },
                function (error) {
                    console.log(error);
                    vm.completeShipmentErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericRemoveErrorMessage;
                    vm.feedback.addError(vm.completeShipmentErrorMessage);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function setPermissions() {
            vm.hasPermission.toComplete = RlsUiSession.user.isAnAdmin;
            vm.hasPermission.toCompleteShipment = RlsUiSession.user.isAnAdmin;
        }

        function validateDateRange() {
            vm.feedback.clear();

            var fromDateMoment = moment(vm.exceptions.fromText, 'YYYY-MM-DDTHH:mm:ss');
            var toDateMoment = moment(vm.exceptions.toText, 'YYYY-MM-DDTHH:mm:ss');

            if (toDateMoment.isSame(fromDateMoment) || toDateMoment.isBefore(fromDateMoment)) {
                vm.feedback.addError('End date must be after ' + fromDateMoment.format('L LT'));
                return;
            }
        }

        function goToRecoveryDevice(recoveryDevice) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('recovery.admin', { recoveryDeviceId: recoveryDevice.id, referrer: returnState, referrerParams: returnStateParams } );
        }
    }
})();

