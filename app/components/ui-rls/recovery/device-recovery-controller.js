(function() {
    'use strict';

    angular
        .module('ui-rls.recovery')
        .controller('RecoveryDeviceController', RecoveryDeviceController);

    /////////////

    RecoveryDeviceController.$inject = ['$rootScope', '$state','DeviceRecoveryService','FeedbackService'];
    function RecoveryDeviceController($rootScope,$state,DeviceRecoveryService,FeedbackService) {
        var vm = {
            recover: recover,
            recoveryAcknowledgement:null,
            token: $state.params.token,
            device:"",
            validtoken:null,
            finish:false
        };
        activate();
        return vm;

        function activate() {
            $rootScope.loading = true;
            var promise = DeviceRecoveryService.getDeviceRecoveryByToken(vm.token).$promise;
            promise.then(
                function (result) {
                  vm.validtoken=true;
                  vm.device= result.deviceRecovery.deviceId;
                  if(result.deviceRecovery.recoveryAcknowledgement){
                    vm.recoveryAcknowledgement = new Date(result.deviceRecovery.recoveryAcknowledgement*1000).toISOString();
                  }
                  vm.device= result.deviceRecovery.deviceId;
                  $rootScope.loading = false;
                },
                function (error) {
                  vm.validtoken=false;
                  $rootScope.loading = false;
                }
            );
        }

        function recover() {
         

            $('#btn-recover').blur();    
            $rootScope.loading = true;
            var promise = DeviceRecoveryService.updateDeviceRecoveryByToken(vm.token).$promise;
            promise.then(
                function (result) {
                   vm.finish=true;
                   $rootScope.loading = false;
                },
                function (error) {
                  vm.feedback.addError(error.data.message);
                  $rootScope.loading = false;
                }
            );
        }
    }



})();