(function() {
    'use strict';

    angular
        .module('ui-sentinel.sentry-reports')
        .controller('SentinelReportsByList', SentinelReportsByList);

    SentinelReportsByList.$inject = ['$rootScope', '$scope', '$state','$filter', 'SentinelUiSession','UomSecondsConverter', 'FeedbackService', 'SentinelAdminApiService'];
    function SentinelReportsByList($rootScope, $scope, $state,$filter, SentinelUiSession,UomSecondsConverter, FeedbackService, SentinelAdminApiService) {
        var vm = {
            currentTab: "params",
            sentinelText: null,
            sentinelIndex: -1,
            sentinelCurrent: null,
            command: null,
            results: null,
            configBy: 'list',
            groups: null,
            groupId: null,
            clear:clear,
            firmwareToMatch: "0.2.0",
            from: moment().subtract(24, 'hour').startOf('minute').format('YYYY-MM-DDTHH:mm:00'),
            to: moment().startOf('minute').format('YYYY-MM-DDTHH:mm:00'),
            batteryMin: 3.6,
            humidityMin: 10,
            rssiMin:-10,
            lightMin: 1,
            pressureMin: 97,
            pressureMax: 102,
            temperatureMin: 18,
            temperatureMax: 40,
            selectBy: 'hours',
            hoursSinceNow: 24,
            goToDeviceReports:goToDeviceReports,
            secondsService: UomSecondsConverter,
            goToParams: goToParams,
            feedback: FeedbackService,
            goToSentinels: goToSentinels,
            goToResults: goToResults,
            start: start,
            list:[]
        };

        activate();
        return vm;

        function activate() {
            vm.feedback.clear();
            
            $scope.$watch(
                function() {
                    return vm.results;
                },
                function (results) {

                }, true
            );


            load();
        }

        function load() {
            vm.groups = null;
            vm.groupId = null;
            /*var promise = DeviceGroupsService.getGroups(SentinelUiSession.focus).$promise;
            promise.then(
                function(result) {
                    vm.groups = result;
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );*/
        }

        function clear(){
            vm.sentinelText=null;
            vm.list=[];
        }

        function goToParams() {
            vm.currentTab = 'params';
        }

     
        function goToSentinels() {
            vm.currentTab = 'sentinels';
        }

        function goToResults() {
            if (vm.list) {
                vm.currentTab = 'results';
            }
        }

        function start() {
            if (vm.configBy === 'list' && (!vm.sentinelText)) {
                return;
            }

            if (vm.selectBy === 'hours' && !vm.hoursSinceNow){
                return;
            }
            if (vm.selectBy === 'range' && !vm.from && !vm.to){
                return;
            }

           
            $rootScope.loading = true;

            vm.sentinelList = null;
            vm.results = null;
            vm.sentinelCurrent = null;
            vm.sentinelReports = null;
            vm.sentinelFirmware = null;
            vm.sentinelIndex = -1;
            var results = [];

            if (vm.configBy === 'list') {
                vm.sentinelList = _.split(vm.sentinelText, '\n');
                for (var i = 0; i < vm.sentinelList.length; i++) {
                    results.push(vm.sentinelList[i]
                    );
                }
                vm.results = results;
                vm.currentTab = 'results';
                $rootScope.loading = true;
                if (vm.selectBy === 'hours') {
                    vm.to = moment().toISOString();
                    vm.from = moment().subtract(vm.hoursSinceNow, 'hours').toISOString();
                }

                var listPromise = SentinelAdminApiService.listSentinel500ReportsBylist(results,vm.from,vm.to).$promise;
                listPromise.then(
                    function(result) {
                       vm.list=result;
                       for (var i = vm.list.length - 1; i >= 0; i--) {
                           validateData(vm.list[i]);
                       }
                    },
                    function (error) {
                        console.log(error);
                        vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                    }
                ).finally(function(){
                    $rootScope.loading = false;
                });
            }
           
        }



        function validateData(result) {

            if (!result.sentinelStatus) {
                result.bBattery = false;
                result.bLight = false;
                result.bPressure = false;
                result.bTemperature = false;
            }
            else {
                result.bBattery = validateBattery(result.sentinelStatus.batteryVoltage);
                result.bLight = validateLight(result.sentinelStatus.light);
                result.bHumidity = validateHumidity(result.sentinelStatus.humidity);
                result.bFirmware = validateFirmware(result.sentinelStatus.firmwareVersion);
                result.bPressure = validatePressure(result.sentinelStatus.pressureValue);
                result.bTemperature = validateTemperature(result.sentinelStatus.temperature);
            }
           
            
        }

        function validateFirmware(firmware) {
            if (!vm.firmwareToMatch)
                return true;

            if (!firmware)
                return false;

            return firmware.trim() === vm.firmwareToMatch.trim();
        }

       
    
        function validateBattery(batteryVoltage) {
            var result = true;
            if (batteryVoltage < vm.batteryMin) {
                result = false;
            }            
            return result;
        }
        function validateLight(light) {
            var result = false;
            if (light >= vm.lightMin) {
                result = true;
             }
            return result;
        }

        function validateHumidity(humidity) {
            var result = false;
            if (humidity >= vm.humidityMin) {
                result = true;
             }
            return result;
        }

         function validateRssi(rssi) {
            var result = false;
            if (rssi >= vm.rssiMin) {
                result = true;
             }
            return result;
        }

        function validatePressure(pressure) {
            var result = true;
            if (pressure < vm.pressureMin || pressure > vm.pressureMax) {
                result = false;
             }
            return result;
        }
        function validateTemperature(temperatureC) {
            var result = true;
            if (temperatureC < vm.temperatureMin || temperatureC > vm.temperatureMax) {
                result = false;
            }
            return result;
        }

        function goToDeviceReports(item) {
            if (item.sentinelStatus) {
                var from = moment(item.sentinelStatus.timeOfReport).subtract(4, 'days').format('YYYY-MM-DDTHH:mm:ss');
                var to = moment(item.sentinelStatus.timeOfReport).format('YYYY-MM-DDTHH:mm:ss');
                $state.go('sightings.of-mac',{ mac: item.sentinelId,to:to,from:from, referrer: 'sentinel-reports-by-list'  });
            }
        }        
   
    }
})();

