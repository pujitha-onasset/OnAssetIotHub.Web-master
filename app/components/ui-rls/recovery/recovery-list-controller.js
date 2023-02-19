(function() {
    'use strict';

    angular
        .module('ui-rls.recovery')
        .controller('RecoveryListController', RecoveryListController);

    RecoveryListController.$inject = ['$rootScope', '$scope', '$state', 'RlsUiSession', 'RecoveryDataService', 'RecoveryFilterService', 'FeedbackService', 'DeviceRecoveryService'];
    function RecoveryListController($rootScope, $scope, $state, RlsUiSession, RecoveryDataService, RecoveryFilterService, FeedbackService, DeviceRecoveryService) {
        var vm = {
            devices: RecoveryDataService,
            filterService: RecoveryFilterService,
            feedback: FeedbackService,
            propertyName: 'clientId',
            reverse: false,
            sortBy: sortBy,
            removeDeviceRecovery: null,
            removeInProgress: false,
            removeBegin: removeBegin,
            removeCancel: removeCancel,
            removeSubmit: removeSubmit,
            hasPermission: {
                toRemove: false,
            },
            setPermissions: setPermissions,
            validateDateRange: validateDateRange,
            goToRecoveryDevice: goToRecoveryDevice,
        };
        var genericRemoveErrorMessage = "Unexpected error ocurred while removing the device from recovery list";
        activate();
        return vm;

        function activate() {
            $('.modal').modal('hide');
            vm.feedback.clear();
            setPermissions();

            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'recovery.list') {
                    vm.devices.load();
                }
            });

            load();
        }

        function load() {
            vm.devices.load();
        }

        function sortBy(propertyName) {
            vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
        }

        function removeBegin(device) {
            vm.removeInProgress = true;
            vm.removeDeviceRecovery = device;
            vm.removeErrorMessage = null;
        }
        
        function removeCancel() {
            vm.removeErrorMessage = null;
            vm.removeInProgress = false;
            vm.removeDeviceRecovery = null;
        }
        
        function removeSubmit() {
            if (!vm.removeDeviceRecovery || !vm.removeDeviceRecovery.id ) {
                return;
            }
            $rootScope.loading = true;
            vm.removeErrorMessage = null;

            var promise = DeviceRecoveryService.deleteDeviceRecovery(vm.removeDeviceRecovery.id).$promise;
            promise.then(
                function(result) {
                    load();
                    removeCancel();
                },
                function (error) {
                    console.log(error);
                    vm.removeErrorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericRemoveErrorMessage;
                    vm.feedback.addError(vm.removeErrorMessage);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function setPermissions() {
            vm.hasPermission.toRemove = RlsUiSession.user.isSystemAdmin;
        }

        function validateDateRange() {
            vm.feedback.clear();

            var fromDateMoment = moment(vm.devices.fromText, 'YYYY-MM-DDTHH:mm:ss');
            var toDateMoment = moment(vm.devices.toText, 'YYYY-MM-DDTHH:mm:ss');

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

