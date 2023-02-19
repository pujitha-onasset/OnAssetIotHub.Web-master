(function() {
    'use strict';

    angular
        .module('ui-sentinel.simulators')
        .controller('WarehouseSimulatorController', WarehouseSimulatorController);

    /////////////

    WarehouseSimulatorController.$inject = ['$rootScope', '$scope', '$state', 'SentinelUiSession', 'SightingsAdminApiService', 'SightingsAccountApiService'];
    function WarehouseSimulatorController($rootScope, $scope, $state, SentinelUiSession, SightingsAdminApiService, SightingsAccountApiService) {

        var vm = {
            locationResults: [],
            sightings: [],
            mac: null, //'247189040185',
            imeiList: null, //'357164040897269\n357164042279706\n014144000084863',
            from: moment().subtract(4, 'hour').startOf('minute').format('YYYY-MM-DDTHH:mm:00'),
            to: moment().startOf('minute').format('YYYY-MM-DDTHH:mm:00'),
            decisionWindow: 15,
            algorithm: 'mobileApp',
            selectBy: 'hours',
            hoursSinceNow: 8,
            hideParams: false,
            isLoading: false,
            locateFor: 'list',
            selectedResult: false,
            toggleParams: toggleParams,
            submit: load,
            showSightings: showSightings,
            hideSightings: hideSightings
        };

        var genericErrorMessage = "Unexpected error ocurred while getting the warehouse simulator";
        activate();
        return vm;

        function activate() {
            //load();
            //set default dates
            if (!vm.lastReport) {
                vm.from = moment().subtract(vm.hoursSinceNow, 'hour').startOf('minute').format('YYYY-MM-DDTHH:mm:00');
                vm.to = moment().startOf('minute').format('YYYY-MM-DDTHH:mm:00');
            }
            else {
                vm.to = moment(vm.lastReport.timeOfReport).startOf('minute').format('YYYY-MM-DDTHH:mm:00');
                vm.from = moment(vm.to).subtract(vm.hoursSinceNow, 'hour').startOf('minute').format('YYYY-MM-DDTHH:mm:00');
            }
        }

        function toggleParams() {
            vm.hideParams = !vm.hideParams;
        }

        function load() {
            vm.sightings = [];
            vm.locationResults = [];
            vm.errorMessage = null;

            if(!vm.mac){
                vm.errorMessage = "Please provide a valid Sentinel MAC";
            } else if(!vm.imeiList && vm.locateFor === 'list') {
                vm.errorMessage = "Please provide at least one Sentry IMEI";
                return;
            }

            if (!vm.mac || !vm.from || !vm.to || !vm.decisionWindow)
                return;

            if (!moment(vm.from).isValid() || !moment(vm.to).isValid())
                return;

            $rootScope.loading = true;

            var fromMoment = moment(vm.from);
            var toMoment = moment(vm.to);

            if (fromMoment.isAfter(toMoment))
                return;

            var imeis = _.split(vm.imeiList, '\n');

            var promise = SentinelUiSession.user.isAnAdmin ?
                SightingsAdminApiService.listSightingsOfMac(SentinelUiSession.focus, vm.mac, fromMoment, toMoment, 1, 500).$promise :
                SightingsAccountApiService.listSightingsOfMac(vm.mac, fromMoment, toMoment, 1, 500).$promise;
            promise.then(
                function (result) {

                    var sightings = result;
                    if (vm.locateFor === 'list') {
                        sightings = _.remove(result, function (o) {
                            return  imeis.indexOf(o.imei) > -1;
                        });
                    }

                    _.reverse(sightings);

                    switch (vm.algorithm) {
                        case 'lookBack5':
                            lookBack(sightings, 5);
                            break;
                        case 'lookBack10':
                            lookBack(sightings, 10);
                            break;
                        case 'lookBack15':
                            lookBack(sightings, 15);
                            break;
                        default:
                            emulate(sightings);
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

        function showSightings(index, result) {

            vm.selectedResult =
                {
                    index: index,
                    result: result
                };
        }

        function hideSightings() {
            vm.selectedResult = null;
        }


        function emulate(sightings) {
            if (!sightings || sightings.length === 0) {
                return;
            }

            var locationResults = [];
            //add the first record as first zone
            locationResults.push({
                imei: sightings[0].imei,
                window: sightings[0].timeOfSighting,
                timeOfSighting: sightings[0].timeOfSighting,
                rssi: sightings[0].rssi
            });

            var minuteOffset = moment(sightings[0].timeOfSighting).minute() -  moment(sightings[0].timeOfSighting).startOf('hour').minute();
            var beginOffset = 15;
            if (minuteOffset >= 0 && minuteOffset < 15) {
                beginOffset = 15;
            }
            else if (minuteOffset >= 15 && minuteOffset < 30) {
                beginOffset = 30;
            }
            else if (minuteOffset >= 30 && minuteOffset < 45) {
                beginOffset = 45;
            }
            else if (minuteOffset >= 45 && minuteOffset <= 59) {
                beginOffset = 60;
            }
            var windowStart = moment(sightings[0].timeOfSighting).startOf('hour').add(beginOffset,'minute');
            var windowEnd = moment(windowStart).add(vm.decisionWindow, 'minute');
            var toMoment = moment(vm.to);
            var i = 1;

            sightings[0].window = sightings[0].timeOfSighting;

            var imeiSightings = {};
            var bestSighting = null;

            while (windowStart.isBefore(toMoment)) {
                imeiSightings = {};

                while (i < sightings.length - 1) {

                    if (moment(sightings[i].timeOfSighting).isAfter(windowEnd)) {

                        Object.keys(imeiSightings).forEach(function(imei) {
                            if (!bestSighting || imeiSightings[imei].rssi > bestSighting.rssi) {
                                bestSighting = imeiSightings[imei];
                            }
                        });

                        if (bestSighting !== null) {
                            locationResults.push({
                                imei: bestSighting.imei,
                                window: windowStart.toISOString(),
                                timeOfSighting: bestSighting.timeOfSighting,
                                rssi: bestSighting.rssi
                            });
                        }
                        break;
                    }

                    sightings[i].window = windowStart.toISOString();


                    if (!imeiSightings[sightings[i].imei] || moment(sightings[i].timeOfSighting).isAfter(moment(imeiSightings[sightings[i].imei]))) {
                        imeiSightings[sightings[i].imei] = sightings[i];
                    }
                    i++;
                }

                windowStart.add(vm.decisionWindow, 'minute');
                windowEnd.add(vm.decisionWindow, 'minute');
            }

            Object.keys(imeiSightings).forEach(function(imei) {
                if (!bestSighting || imeiSightings[imei].rssi > bestSighting.rssi) {
                    bestSighting = imeiSightings[imei];
                }
            });

            if (bestSighting !== null) {
                locationResults.push({
                    imei: bestSighting.imei,
                    window: moment(windowStart).subtract(15, 'minute').toISOString(),
                    timeOfSighting: bestSighting.timeOfSighting,
                    rssi: bestSighting.rssi
                });
            }

            sightings[sightings.length-1].window = moment(windowStart).subtract(15, 'minute').toISOString();

            sightings = _.orderBy(sightings, ['window', 'rssi'], ['asc', 'desc']);

            vm.sightings = sightings;
            vm.locationResults = locationResults;
        }

        function lookBack(sightings, offset) {
            if (!sightings || sightings.length === 0) {
                return;
            }

            var locationResults = [];

            var minuteOffset = moment(sightings[0].timeOfSighting).minute() -  moment(sightings[0].timeOfSighting).startOf('hour').minute();
            var beginOffset = 0;
            if (minuteOffset >= 0 && minuteOffset < 15) {
                beginOffset = 0;
            }
            else if (minuteOffset >= 15 && minuteOffset < 30) {
                beginOffset = 15;
            }
            else if (minuteOffset >= 30 && minuteOffset < 45) {
                beginOffset = 30;
            }
            else if (minuteOffset >= 45 && minuteOffset <= 59) {
                beginOffset = 45;
            }
            var windowStart = moment(sightings[0].timeOfSighting).startOf('hour').add(beginOffset,'minute');
            var windowEnd = moment(windowStart).add(vm.decisionWindow, 'minute');
            var toMoment = moment(vm.to).subtract(offset, 'minute');
            var i = 0;

            var imeiSightings = {};
            var bestSighting = null;
            while (windowStart.isBefore(toMoment)) {
                imeiSightings = {};

                while (i < sightings.length - 1 && moment(sightings[i].timeOfSighting).isBefore(toMoment)) {

                    if (moment(sightings[i].timeOfSighting).isAfter(windowEnd)) {


                        Object.keys(imeiSightings).forEach(function(imei) {
                            if (!bestSighting || imeiSightings[imei].rssi > bestSighting.rssi) {
                                bestSighting = imeiSightings[imei];
                            }
                        });

                        if (bestSighting !== null) {
                            locationResults.push({
                                imei: bestSighting.imei,
                                window: windowStart.toISOString(),
                                timeOfSighting: bestSighting.timeOfSighting,
                                rssi: bestSighting.rssi
                            });
                        }
                        break;
                    }

                    sightings[i].window = windowStart.toISOString();


                    if (!imeiSightings[sightings[i].imei] || moment(sightings[i].timeOfSighting).isAfter(moment(imeiSightings[sightings[i].imei]))) {
                        imeiSightings[sightings[i].imei] = sightings[i];
                    }
                    i++;
                }

                windowStart.add(vm.decisionWindow, 'minute');
                windowEnd.add(vm.decisionWindow, 'minute');
            }

            Object.keys(imeiSightings).forEach(function(imei) {
                if (!bestSighting || imeiSightings[imei].rssi > bestSighting.rssi) {
                    bestSighting = imeiSightings[imei];
                }
            });

            if (bestSighting !== null) {
                locationResults.push({
                    imei: bestSighting.imei,
                    window: moment(windowStart).subtract(15, 'minute').toISOString(),
                    timeOfSighting: bestSighting.timeOfSighting,
                    rssi: bestSighting.rssi
                });
            }

            //sightings[sightings.length-1].window = moment(windowStart).subtract(15, 'minute').toISOString();
            sightings = _.orderBy(sightings, ['window', 'rssi'], ['asc', 'desc']);
            vm.sightings = sightings;
            vm.locationResults = locationResults;

        }        


    }

})();