(function() {
    'use strict';

    angular
        .module('ui-sentinel.simulators')
        .controller('SeparationSimulatorController', SeparationSimulatorController);

    /////////////

    SeparationSimulatorController.$inject = ['$rootScope', '$scope', '$state', 'SentinelUiSession', 'SightingsAdminApiService', 'SentryAdminApiService', 'SightingsAccountApiService', 'SentryAccountApiService'];
    function SeparationSimulatorController($rootScope, $scope, $state, SentinelUiSession, SightingsAdminApiService, SentryAdminApiService, SightingsAccountApiService, SentryAccountApiService) {
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
            pivotProperties: properties,
            pivotProperty: {
                name: 'rssi',
                label: 'Rssi (db)'
            },
            page: 1,
            totalPages: 1,
            totalItems: 0,
            pageArray: null,
            itemsPerPage: 500,
            analysisResults: null,
            sightingReports: null,
            sentryReportList: null,
            sentinels: [],
            misses: 1,
            selectBy: 'hours',
            hoursSinceNow: 8,
            from: moment().subtract(8, 'hour').startOf('minute').format('YYYY-MM-DDTHH:mm:00'),
            to: moment().startOf('minute').format('YYYY-MM-DDTHH:mm:00'),
            detectFor: 'any',
            macList: null, //'CC78AB8A7D02\nCC78AB8A7F84\nCC78AB8A7F85',
            hideParams: false,
            isLoading: false,
            toggleParams: toggleParams,
            load: load,
            sightingEvent: sightingEvent,
            submit: load,
            sightingClass: sightingClass,
            sightingValue: sightingValue,
            next: next,
            previous: previous,
            gotoPage: gotoPage,
            gotoReport: gotoReport,
            changePivotProp: changePivotProp


        };

        var genericErrorMessage = "Unexpected error ocurred while getting the separation simulator";
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

        function load() {
            if (vm.detectFor === 'list' && !vm.macList) {
                return;
            }
            if (vm.selectBy === 'hours' && !vm.hoursSinceNow){
                //todo: what if not a number, a negative number, or a decimal
                return;
            }
            if (vm.selectBy === 'range' && !vm.from && !vm.to){
                //todo: what if not a date?
                return;
            }
            if (!vm.to || !vm.from) {
                return;
            }

            vm.errorMessage = null;
            $rootScope.loading = true;

            if (vm.imei === null || vm.imei === "" || typeof vm.imei === undefined) {
                vm.errorMessage = "Please provide a valid Sentry IMEI";
                $rootScope.loading = false;
                return;
            }

            var to = moment(vm.to);
            var from = moment(vm.from);
            if (vm.selectBy === 'hours') {
                to = moment().toISOString();
                from = moment().subtract(vm.hoursSinceNow, 'hours').toISOString();
            }

            vm.sentinels = [];
            vm.sightingReports = [];
            if (vm.detectFor === 'list') {
                var macs = _.split(vm.macList, '\n');
                _.forEach(macs, function(mac) {
                    vm.sentinels.push({
                        mac: mac,
                        misses: 0
                    });
                });
            }

            vm.isLoading = true;

            //todo: fix for account user
            var countPromise = SentinelUiSession.user.isAnAdmin ?
                SentryAdminApiService.countSentry500SentinelReportsByDevice(SentinelUiSession.focus, vm.imei, from, to, 15).$promise :
                SentryAccountApiService.countSentry500SentinelReportsByDevice(vm.imei, from, to, 15).$promise;
            var pivotPromise = SentinelUiSession.user.isAnAdmin ?
                SightingsAdminApiService.getSightingsPivotReport(SentinelUiSession.focus, vm.imei, from, to, 15, vm.page).$promise :
                SightingsAccountApiService.getSightingsPivotReport(vm.imei, from, to, 15, vm.page).$promise;

            if (!pivotPromise || !countPromise) {
                return;
            }

            countPromise.then(
                function(result) {
                    vm.totalPages = result.pageCount;
                    vm.totalItems = result.itemCount;

                    var pageArray = [];
                    for (var i = 1; i <= vm.totalPages; i++) {
                        pageArray.push(i);
                    }
                    vm.pageArray = pageArray;
                },
                function (error) {
                    console.log(error);
                }
            );

            pivotPromise.then(
                function(pivotReport) {
                    if (vm.detectFor === 'any') {
                        _.forEach(pivotReport.macList, function(mac) {
                            vm.sentinels.push({
                                mac: mac,
                                misses: 0
                            });
                        });
                    }
                    vm.sentryReportList = pivotReport.sentryReportList;
                    analyze();
                },
                function (error) {
                    console.log(error);
                    vm.sightingReports = [];
                    vm.isLoading = false;
                    vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;

                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function sightingEvent(sentinel, report) {
            var result = {
                class: 'success',
                rssi: null
            };
            var sightingIndex =  _.findIndex(report.sightingList, function(o) { return o.mac === sentinel.mac; });

            if (sightingIndex === -1) {
                ++sentinel.misses;
                result.class = sentinel.misses >= vm.misses ? 'danger' : 'warn';
            }
            else {
                sentinel.misses = 0;
                result.rssi = report.sightingList[sightingIndex].rssi;
            }

            return result;
        }

        function toggleParams() {
            vm.hideParams = !vm.hideParams;
        }

        function analyze() {
            var reports = vm.sentryReportList;
            var results = [];

            _.forEach(vm.sentinels, function(sentinel) {
                _.forEach(reports, function(report) {
                    var result = {
                        mac: sentinel.mac,
                        reportId: report.reportId,
                        class: 'success',
                        value: null
                    };

                    var sightingIndex =  _.findIndex(report.sightingList, function(o) { return o.mac === sentinel.mac; });

                    if (sightingIndex === -1) {
                        ++sentinel.misses;
                        result.class = sentinel.misses >= vm.misses ? 'danger' : 'warning';
                        result.value = sentinel.misses >= vm.misses ? 'separated' : 'warning';
                    }
                    else {
                        sentinel.misses = 0;
                        result.value = report.sightingList[sightingIndex][vm.pivotProperty.name];  //this is the value that needs to be changed
                    }
                    results.push(result);
                });
            });

            vm.sightingReports = _.orderBy(reports, ['timeOfReport'], ['desc']);
            vm.analysisResults = results;
            vm.isLoading = false;

        }

        function sightingClass(sentinel, report) {
            var index = _.findIndex(vm.analysisResults, function(o) {
                return o.mac === sentinel.mac && o.reportId === report.reportId;
            });

            return index > -1 ? vm.analysisResults[index].class : null;
        }

        function sightingValue(sentinel, report) {
            var index = _.findIndex(vm.analysisResults, function(o) {
                return o.mac === sentinel.mac && o.reportId === report.reportId;
            });

            return index > -1 ? vm.analysisResults[index].value : null;
        }

        function next() {
            gotoPage(vm.page + 1);
        }

        function previous() {
            gotoPage(vm.page - 1);
        }

        function gotoPage(page) {
            if (page < 1 || page > vm.totalPages) {
                return;
            }
            vm.page = page;
            load();
        }

        function gotoReport(report) {
            $state.go('sightings.for-report', { reportId: report.reportId});
        }

        function changePivotProp(name) {
            var prop = _.find(vm.pivotProperties, function(v) {
                return v.name === name;
            });

            vm.pivotProperty = prop !== undefined ? prop : vm.pivotProperties.rssi;
            analyze();
        }
        
    }

})();