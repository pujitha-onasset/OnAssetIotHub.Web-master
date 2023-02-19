(function() {
    'use strict';

    angular
        .module('ui-sentinel.sentry-configs')
        .controller('SentryConfigsByDeviceController', SentryConfigsByDeviceController);

    /////////////

    SentryConfigsByDeviceController.$inject = ['$rootScope', '$state', 'SentinelUiSession', 'SentryAdminApiService', 'SentryAccountApiService', 'SeparationSelectionService'];
    function SentryConfigsByDeviceController($rootScope, $state, SentinelUiSession, SentryAdminApiService, SentryAccountApiService, SeparationSelectionService) {
        var vm = {
            imei: $state.params.imei,
            assignmentAccountId: $state.params.assignmentAccountId,
            load: load,
            errorMessage: null,
            warningMessage: null,
            configuration: null,
            ambientTemperatureAlarmEnabled: true,
            ambientTemperatureInterval: 0,
            ambientTemperatureLowLimit: 0,
            ambientTemperatureHighLimit: 0,
            humidityAlarmEnabled: true,
            humidityInterval: 0,
            humidityLowLimit: 0,
            humidityHighLimit: 0,
            pressureAlarmEnabled: true,
            pressureInterval: 0,
            pressureLowLimit: 0,
            pressureHighLimit: 0,
            lightAlarmEnabled: true,
            lightAlarmInterval: 0,
            lightLowLimit: 0,
            lightHighLimit: 0,
            wifiAlarmEnabled:true,           
            ssid:null,            
            password:null,
            shockAlarmEnabled: true,
            shockInterval: 0,
            shockThreshold: 0,
            wakeOnVibration: true,
            batchCount: 0,
            batchFlags_GPSFetch: true,
            batchFlags_CellFetch: true,
            serverAddress: null,
            serverPort: 0,
            ftpAddress: null,
            ftpPort: 0,
            ftpUsername: null,
            ftpPassword: null,
            timestamp: 0,
            timestampAtTransmission: 0,
            timeOfReceipt: 0,
            timeOfReport: 0,
            operationalMode: null,
            standardPeriodicReportInterval: 0,
            extendedPeriodicReportInterval: 0,
            retryInterval: 0,
            extendedBatteryAttached: null,
            flashloaderVersion: null,
            applicationVersion: null,
            upgradeManagerRevisionId: 0,
            actions: {              
                goToDeviceMap: goToDeviceMap,
                goToDeviceReports: goToDeviceReports
            },
            hasPermission: {
                toReadAdminConfigs: false,
                toChangeAdminConfigs: false,
                toChangeConfigs: false,
                toCancelCommands: false
            }
        };

        var genericErrorMessage = "Unexpected error ocurred while getting the sentry configuration";
        activate();
        return vm;

        function activate() {
            load();
        }

        function load() {
            vm.errorMessage = null;
            vm.warningMessage = null;
            
            setPermissions(vm);
            var configPromise = SentryAdminApiService.getConfig(SentinelUiSession.focus, vm.assignmentAccountId, vm.imei).$promise;

            if (!configPromise) {
                return;
            }

            $rootScope.loading = true;

            configPromise.then(
                function(result) {
                    console.log(result);
                    vm.configuration =result;
                    angular.forEach(result, function(value, key) {
                      this[key] = value;
                    }, vm);
                },
                function (error) {
                    console.log(error);
                    vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function setPermissions() {
         
            vm.hasPermission.toReadAdminConfigs =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isSupportAdmin ||
                SentinelUiSession.user.isSupportObserver;

            vm.hasPermission.toChangeAdminConfigs =
                SentinelUiSession.user.isSystemAdmin;

            vm.hasPermission.toChangeConfigs = vm.hasPermission.toCancelCommands =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;

        }

        function goToDeviceMap() {
         
            $state.go('device.map',{ deviceTagId: vm.imei, referrer: 'devices.map'  });
            
        }

        function goToDeviceReports() {
            $state.go('sentry-reports.by-device', { imei: vm.imei, view: 'prior' });

        }
    }    
   
})();