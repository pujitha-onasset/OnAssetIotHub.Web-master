(function() {
    'use strict';

    angular
        .module('ui-sentinel.sentry-reports')
        .controller('SentryReportsByList', SentryReportsByList);

    SentryReportsByList.$inject = ['$rootScope', '$scope', '$state','$filter', 'SentinelUiSession','UomSecondsConverter', 'FeedbackService', 'SentryAdminApiService'];
    function SentryReportsByList($rootScope, $scope, $state,$filter, SentinelUiSession,UomSecondsConverter, FeedbackService, SentryAdminApiService) {
        var vm = {
            currentTab: "params",
            sentryText: null,
            imeiIndex: -1,
            imeiCurrent: null,
            command: null,
            results: null,
            configBy: 'list',
            groups: null,
            groupId: null,
            clear:clear,
            firmwareToMatch: "",
            from: moment().subtract(24, 'hour').startOf('minute').format('YYYY-MM-DDTHH:mm:00'),
            to: moment().startOf('minute').format('YYYY-MM-DDTHH:mm:00'),
            reportNumberMin: 1,
            gpsLocationMin: 1,
            storeAndForwardRatio: 75,
            batteryMin: 70,
            rssiMin:-10,
            lightMin: 1,
            pressureMin: 97,
            pressureMax: 102,
            temperatureMin: 18,
            temperatureMax: 40,
            firmwareToMatch: null,
            results:null,
            selectBy: 'hours',
            hoursSinceNow: 24,
            goToDeviceReports:goToDeviceReports,
            secondsService: UomSecondsConverter,
            goToParams: goToParams,
            feedback: FeedbackService,
            goToSentrys: goToSentrys,
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
            vm.sentryText=null;
            vm.list=[];
        }

        function goToParams() {
            vm.currentTab = 'params';
        }

     
        function goToSentrys() {
            vm.currentTab = 'sentrys';
        }

        function goToResults() {
            if (vm.list) {
                vm.currentTab = 'results';
            }
        }

        function start() {
            console.log("Start...");
            if (vm.configBy === 'list' && (!vm.sentryText)) {
                return;
            }

            if (vm.selectBy === 'hours' && !vm.hoursSinceNow){
                return;
            }
            if (vm.selectBy === 'range' && !vm.from && !vm.to){
                return;
            }

           
            vm.imeiList = null;
            vm.results = null;
            vm.imeiCurrent = null;
            vm.imeiReports = null;
            vm.imeiReports = null;
            vm.imeiIndex = -1;
            var results = [];

            if (vm.configBy === 'list') {
                vm.imeiList = _.split(vm.sentryText, '\n');
                for (var i = 0; i < vm.imeiList.length; i++) {
                    results.push({
                        imei: vm.imeiList[i],
                        grade: null,
                        reports: null,
                        gps: null,
                        storeAndForward: null,
                        battery: null,
                        light: null,
                        pressure: null,
                        temperature: null,
                        firmware: !vm.firmwareToMatch ? true : null
                    }
                    );
                }
                vm.results = results;
                vm.currentTab = 'results';
                
                if (vm.selectBy === 'hours') {
                    vm.to = moment().toISOString();
                    vm.from = moment().subtract(vm.hoursSinceNow, 'hours').toISOString();
                }

                getDataForNextImei();

            }
           
        }

        function getDataForNextImei() {
            console.log("getDataForNextImei()");
            vm.imeiIndex++;
            if (vm.imeiIndex >= vm.imeiList.length) {
                if (vm.validateBy === 'device') {
                    $('#anotherImei').focus();
                }
                return;
            }

            vm.imeiCurrent = null;
            vm.imeiReports = null;
            vm.imeiFirmware = null;

            vm.imeiCurrent = vm.imeiList[vm.imeiIndex];
            var countPromise = 
                SentryAdminApiService.countSentry500SentinelReportsByDevice(SentinelUiSession.focus, vm.imeiCurrent, vm.from, vm.to).$promise ;
            var listPromise =
                SentryAdminApiService.listSentry500SentinelReportsByDevice(SentinelUiSession.focus, vm.imeiCurrent, vm.from, vm.to, 1).$promise;
              
            if (!countPromise || !listPromise) {
                return;
            }
            listPromise.then(
                function (results) {
                    vm.imeiReports = results;

                    if (vm.firmwareToMatch) {
                        var firmwarePromise = SentryAdminApiService.getConfig(SentinelUiSession.focus,SentinelUiSession.focus.id, vm.imeiCurrent ).$promise;
                        firmwarePromise.then(
                            function (firmwareResult) {
                                //console.log("config",firmwareResult);
                                vm.imeiFirmware = firmwareResult;
                                validateDataForImei();
                            },
                            function (firmwareError) {
                                //vm.imeiFirmware = null;
                                validateDataForImei();
                            }
                        );
                    }
                    else {
                        validateDataForImei();
                        console.log("vm.results",vm.results);
                    }
                },
                function (error) {
                    vm.imeiReports = null;
                    validateDataForImei();
                }
            );
        }

        function validateDataForImei() {
            var imeiResult = vm.results[vm.imeiIndex];

            if (!vm.imeiReports || vm.imeiReports.length === 0) {
                imeiResult.reports = false;
                imeiResult.gps = false;
                imeiResult.storeAndForward = false;
                imeiResult.battery = false;
                imeiResult.light = false;
                imeiResult.pressure = false;
                imeiResult.temperature = false;
            }
            else {
                imeiResult.reports = validateReports();
                imeiResult.gps = validateGps();
                imeiResult.storeAndForward = validateStoreAndForward();
                imeiResult.battery = validateBattery();
                imeiResult.light = validateLight();
                imeiResult.pressure = validatePressure();
                imeiResult.temperature = validateTemperature();
            }

            imeiResult.firmware = validateFirmware();

            imeiResult.grade = imeiResult.reports &&
                imeiResult.gps &&
                imeiResult.storeAndForward &&
                imeiResult.battery &&
                imeiResult.light &&
                imeiResult.pressure &&
                imeiResult.temperature &&
                imeiResult.firmware;

            getDataForNextImei();
        }

        function validateReports() {
            return vm.imeiReports.length >= vm.reportNumberMin;
        }

        function validateFirmware() {
            if (!vm.firmwareToMatch)
                return true;

            if (!vm.imeiFirmware)
                return false;

            return vm.imeiFirmware.applicationVersion.toUpperCase() === vm.firmwareToMatch.toUpperCase();
        }

        function validateGps() {
            var count = 0;
            _.forEach(vm.imeiReports, function(report) {
                if (report.locationMethod === 'Gps')
                    count++;
            });
            return count >= vm.gpsLocationMin;
        }

        function validateStoreAndForward() {
            var count = 0;
            _.forEach(vm.imeiReports, function(report) {
                if (!report.isStoreAndForward) {
                    count++;
                }
            });
            var ratio = count / vm.imeiReports.length;
            return ratio >= vm.storeAndForwardRatio / 100;
        }

        function validateBattery() {
            var result = true;
            _.forEach(vm.imeiReports, function(report) {
                if (report.battery < vm.batteryMin) {
                    result = false;
                    return false; //exit the loop
                }
            });
            return result;
        }
        function validateLight() {
            var result = false;
            _.forEach(vm.imeiReports, function(report) {
                if (report.lightValue >= vm.lightMin) {
                    result = true;
                    return false; //exit the loop
                }
            });
            return result;
        }

        function validatePressure() {
            var result = true;
            _.forEach(vm.imeiReports, function(report) {
                if (report.pressureValue < vm.pressureMin || report.pressureValue > vm.pressureMax) {
                    result = false;
                    return false; //exit the loop
                }
            });
            return result;
        }
        function validateTemperature() {
            var result = true;
            _.forEach(vm.imeiReports, function(report) {
                if (report.temperatureValueC < vm.temperatureMin || report.temperatureValueC > vm.temperatureMax) {
                    result = false;
                    return false; //exit the loop
                }
            });
            return result;
        }


        function goToDeviceReports(item) {
            if (item.reports) {
                $state.go('sentry-reports.by-device',{ imei: item.imei,to:vm.to,from:vm.from, referrer: 'sentry-reports-by-list'  });
            }
        }        
   
    }
})();

