(function() {
    'use strict';

    angular
        .module('ui-sentinel.sightings')
        .controller('SightingsPivotController', SightingsPivotController);

    /////////////

    SightingsPivotController.$inject = ['$rootScope', '$scope', '$state', 'SentinelUiSession', 'SightingsAdminApiService', 'SightingsAccountApiService'];
    function SightingsPivotController($rootScope, $scope, $state, SentinelUiSession, SightingsAdminApiService, SightingsAccountApiService) {
        var properties = [
            {
                name: 'batteryPercent',
                label: 'Battery (%)'
            },
            {
                name: 'batteryVoltage',
                label: 'Battery (V)'
            },
            {
                name: 'humidity',
                label: 'Humidity (%)'
            },
            {
                name: 'light',
                label: 'Light (lux)'
            },
            {
                name: 'rssi',
                label: 'Rssi (db)'
            },
            {
                name: 'temperatureC',
                label: 'Temperature (\xB0C)'
            },
            {
                name: 'temperatureF',
                label: 'Temperature (\xB0F)'
            },            
            {
                name: 'temperatureProbeC',
                label: 'Probe (\xB0C)'
            },
            {
                name: 'temperatureProbeF',
                label: 'Probe (\xB0F)'
            }
        ];

        
        var vm = {
            imei: $state.params.imei,
            lastReport: $state.params.lastReport,
            firstReport: $state.params.firstReport,
            pivotProperties: properties,
            pivotProperty: {
                name: 'rssi',
                label: 'Rssi (db)'
            },
            sightingReports: null,
            macs: [],
            load: load,
            isSeen: isSeen,
            pivotValue: pivotValue,
            changePivotProp: changePivotProp
        };
        activate();
        return vm;

        function activate() {
            load();
        }

        function isSeen(mac, report) {
            return _.findIndex(report.sightingList, function(o) { return o.mac === mac; }) > -1;
        }

        function load() {
            vm.macs = [];
            vm.sightingReports = null;
            if (!vm.lastReport && !vm.firstReport) {
                return;
            }

            var to = vm.lastReport ? moment(vm.lastReport.timeOfReport) : moment();
            var from = moment(to).subtract(5, 'days');

            var pivotPromise =
                SightingsAdminApiService.getSightingsPivotReport(SentinelUiSession.focus, vm.imei, from, to, 15, 1).$promise;

            if (!pivotPromise) {
                return;
            }

            $rootScope.loading = true;

            pivotPromise.then(
                function(pivotReport) {
                    vm.macs = pivotReport.macList;
                    vm.sightingReports = _.orderBy(pivotReport.sentryReportList, ['timeOfReport'], ['desc']);
                },
                function (error) {
                    console.log(error);
                    vm.sightingReports = [];
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function pivotValue(mac, report) {
            var index =  _.findIndex(report.sightingList, function(o) { return o.mac === mac; });

            if (index === -1) return '';
            return report.sightingList[index][vm.pivotProperty.name];
        }

        function changePivotProp(name) {
            var prop = _.find(vm.pivotProperties, function(v) {
                return v.name === name;
            });
            if (prop !== undefined) {
                vm.pivotProperty = prop;
            }
        }

    }

})();