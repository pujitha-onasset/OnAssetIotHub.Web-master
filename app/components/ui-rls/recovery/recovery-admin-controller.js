(function() {
    'use strict';

    angular
        .module('ui-rls.recovery')
        .controller('RecoveryAdminController', RecoveryAdminController);

    RecoveryAdminController.$inject = ['$rootScope', '$state', '$stateParams', 'RlsUiSession','DeviceRecoveryService', 'FeedbackService'];
    function RecoveryAdminController($rootScope, $state, $stateParams, RlsUiSession, DeviceRecoveryService, FeedbackService) {
        var vm = {
            device: null,
            feedback: FeedbackService,
            removeDeviceRecovery: null,
            removeInProgress: false,
            removeBegin: removeBegin,
            removeCancel: removeCancel,
            removeSubmit: removeSubmit,
            hasPermission: {
                toRemove: false,
            },
            setPermissions: setPermissions,
            close: close,
            load: load,
        };
        var genericRemoveErrorMessage = "Unexpected error ocurred while deleting the recovery device.";
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
            if($stateParams.clearMessage) {
              vm.feedback.clear();
            }

            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'recovery.admin') {
                    $state.go('recovery.list');
                }
            });

            setPermissions();
            load();
        }

        function removeBegin() {
            vm.removeInProgress = true;
            vm.removeDeviceRecovery = vm.device;
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
                    //load();
                    removeCancel();
                    $state.go('recovery.list');
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

        function close() {
            vm.device = null;
            $state.go($stateParams.referrer, $stateParams.referrerParams);
        }

        function load() {
            $rootScope.loading = true;
            var promise = DeviceRecoveryService.getDeviceRecoveryById($stateParams.recoveryDeviceId).$promise;
            promise.then(
                function(result) {
                    vm.device = result;
                },
                function (error) {
                    console.log(error);
                    vm.device = null;
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

    }
})();