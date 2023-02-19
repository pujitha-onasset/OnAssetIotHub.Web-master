(function() {
    'use strict';

    angular
        .module('ui-sentinel.fulfillment')
        .controller('FulfillmentValidateController', FulfillmentValidateController);

    FulfillmentValidateController.$inject = ['$scope', '$state', 'VisionApiDeviceReportsService', 'VisionApiDevicesConfigurationService', 'UomSecondsConverter'];
    function FulfillmentValidateController($scope, $state, VisionApiDeviceReportsService, VisionApiDevicesConfigurationService, UomSecondsConverter) {
        var vm = {
            currentTab: "params",
            imeiSingle: null,
            imeiText: null,
            imeiList: null,
            imeiIndex: -1,
            imeiCurrent: null,
            imeiReports: null,
            imeiFirmware: null,
            from: moment().subtract(24, 'hour').startOf('minute').format('YYYY-MM-DDTHH:mm:00'),
            to: moment().startOf('minute').format('YYYY-MM-DDTHH:mm:00'),
            reportNumberMin: 1,
            gpsLocationMin: 1,
            storeAndForwardRatio: 75,
            batteryMin: 30,
            lightMin: 1,
            pressureMin: 97,
            pressureMax: 102,
            temperatureMin: 18,
            temperatureMax: 40,
            firmwareToMatch: null,
            results: null,
            validateBy: 'device',
            selectBy: 'hours',
            hoursSinceNow: 24,
            secondsService: UomSecondsConverter,
            goToParams: goToParams,
            goToImeis: goToImeis,
            goToResults: goToResults,
            start: start,
            goToDeviceReports: goToDeviceReports
        };
        activate();
        return vm;

        function activate() {
            $scope.$watch(
                function() {
                    return vm.results;
                },
                function (results) {
                    //don't have to do anything but watch it
                }, true
            );
        }

        function goToParams() {
            vm.currentTab = 'params';
        }

        function goToImeis() {
            vm.currentTab = 'imeis';
            if (vm.validateBy === 'device') {
                $('#anotherIemi').focus();
            }
        }

        function goToResults() {
            if (vm.results) {
                vm.currentTab = 'results';
            }
        }

        function start() {
            if (vm.validateBy === 'list' && !vm.imeiText) {
                return;
            }
            if (vm.validateBy === 'device' && !vm.imeiSingle) {
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
            vm.imeiFirmware = null;
            vm.imeiIndex = -1;

            vm.imeiList = vm.validateBy === 'device' ? [vm.imeiSingle] : _.split(vm.imeiText, '\n');
            vm.imeiSingle = null;

            var results = [];
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
                });
            }

            vm.results = results;
            vm.currentTab = 'results';

            if (vm.selectBy === 'hours') {
                vm.to = moment().toISOString();
                vm.from = moment().subtract(vm.hoursSinceNow, 'hours').toISOString();
            }

            getDataForNextImei();
        }

        function getDataForNextImei() {
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
            var reportsPromise = VisionApiDeviceReportsService.getReports(vm.imeiCurrent, vm.from, vm.to, 1, 100).$promise;
            reportsPromise.then(
                function (results) {
                    vm.imeiReports = results;

                    if (vm.firmwareToMatch) {
                        var firmwarePromise = VisionApiDevicesConfigurationService.getFirmware({ deviceTagId: vm.imeiCurrent }).$promise;
                        firmwarePromise.then(
                            function (firmwareResult) {
                                vm.imeiFirmware = firmwareResult;
                                validateDataForImei();
                            },
                            function (firmwareError) {
                                vm.imeiFirmware = 'error';
                                validateDataForImei();
                            }
                        );
                    }
                    else {
                        validateDataForImei();
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

            return vm.imeiFirmware.applicationVersion === vm.firmwareToMatch;
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
                if (report.batteryPercent < vm.batteryMin) {
                    result = false;
                    return false; //exit the loop
                }
            });
            return result;
        }
        function validateLight() {
            var result = false;
            _.forEach(vm.imeiReports, function(report) {
                if (report.light >= vm.lightMin) {
                    result = true;
                    return false; //exit the loop
                }
            });
            return result;
        }
        function validatePressure() {
            var result = true;
            _.forEach(vm.imeiReports, function(report) {
                if (report.pressure < vm.pressureMin || report.pressure > vm.pressureMax) {
                    result = false;
                    return false; //exit the loop
                }
            });
            return result;
        }
        function validateTemperature() {
            var result = true;
            _.forEach(vm.imeiReports, function(report) {
                if (report.temperatureC < vm.temperatureMin || report.temperatureC > vm.temperatureMax) {
                    result = false;
                    return false; //exit the loop
                }
            });
            return result;
        }

        function goToDeviceReports(imei) {
            if (imei) {
                $state.go('device.reports',{ deviceTagId: imei, referrer: 'fulfillment.validate'  });
            }
        }        
    }
})();

