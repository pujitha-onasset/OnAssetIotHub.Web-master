(function() {
    'use strict';

    angular
        .module('ui-sentinel.sightings')
        .controller('LatestSightingsController', LatestSightingsController);

    /////////////

    LatestSightingsController.$inject = ['$rootScope', '$state', 'SentinelUiSession', 'SentryAdminApiService', 'SightingsAdminApiService', 'SentryAccountApiService', 'SightingsAccountApiService', 'SeparationSelectionService'];
    function LatestSightingsController($rootScope, $state, SentinelUiSession, SentryAdminApiService, SightingsAdminApiService, SentryAccountApiService, SightingsAccountApiService, SeparationSelectionService) {
        var pageViews = [
            {
                name: 'latest',
                title: 'Latest Sightings',
                icon: 'fa-clock-o'
            },
            {
                name: 'hours',
                title: 'Sightings in last few hours',
                icon: 'fa-hourglass-o'
            },
            {
                name: 'range',
                title: 'Sightings in a date range',
                icon: 'fa-calendar'
            }
        ];
        
        var vm = {
            list: null,
            page: 1,
            totalPages: 1,
            totalItems: 0,
            pageArray: null,
            itemsPerPage: 500,
            hoursText: 8,
            fromText: moment().subtract(8, 'hours').format('YYYY-MM-DDTHH:mm:ss'),
            toText: moment().format('YYYY-MM-DDTHH:mm:ss'),
            changeView: changeView,
            currentPageView: {
                name: 'latest',
                title: 'Latest Sightings',
                icon: 'fa-clock-o'
            },
            pageViews: pageViews,
            load: load,
            gotoDeviceReports: gotoDeviceReports,
            gotoSightingsForReport: gotoSightingsForReport,
            gotoSightingsByDevice: gotoSightingsByDevice,
            gotoSightingsOfMac: gotoSightingsOfMac,
            gotoSightingsPivotForDevice: gotoSightingsPivotForDevice,
            gotoSeparationSimulator: gotoSeparationSimulator,
            next: next,
            previous: previous,
            gotoPage: gotoPage,
            validateDateRange: validateDateRange,
        };

        var genericErrorMessage = "Unexpected error ocurred while getting the latest sightings";
        activate();
        return vm;

        function activate() {
            load();
        }

        function changeView(viewName) {
            // if (viewName === 'assign') {
            //     assignCancel();
            // }
            var view = _.find(vm.pageViews, function(v) {
                return v.name === viewName;
            });
            if (view !== undefined) {
                vm.currentPageView = view;
            }
        }

        function load() {
            vm.list = null;
            vm.page = 1;
            vm.errorMessage = null;
            $rootScope.loading = true;

            var countPromise;
            var listPromise;
            if (vm.currentPageView.name === 'latest') {
                countPromise = 
                    SightingsAdminApiService.countLatestSightings(SentinelUiSession.focus).$promise ;
                listPromise = 
                    SightingsAdminApiService.latestSightings(SentinelUiSession.focus, vm.page).$promise;
            }
            else {
                var from;
                var to;
                if (vm.currentPageView.name === 'hours') {
                    from = moment().subtract(vm.hoursText, 'hour');
                    to = moment();
                }
                else {
                    from = moment(vm.fromText);
                    to = moment(vm.toText);
                }

                countPromise =
                    SightingsAdminApiService.countSightings(SentinelUiSession.focus, from, to).$promise ;
                listPromise = 
                    SightingsAdminApiService.listSightings(SentinelUiSession.focus, from, to, vm.page).$promise ;
            
            }

            if (!countPromise || !listPromise) {
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
                    vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                }
            );

            listPromise.then(
                function(result) {
                    vm.list = result;
                },
                function (error) {
                    console.log(error);
                    vm.list = [];
                    vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function gotoDeviceReports(report) {
            var from = moment(report.timeOfReceipt).subtract(1, 'days').toISOString();
            $state.go('sentry-reports.by-device', { imei: report.imei, view: 'prior', to: report.timeOfReceipt, from: from});
        }

        function gotoSightingsForReport(report) {
            $state.go('sightings.for-report', { reportId: report.sentryStatusId });
        }

        function gotoSightingsByDevice(report) {
            var from = moment(report.timeOfReceipt).subtract(1, 'days').toISOString();
            $state.go('sightings.by-device', { imei: report.imei, to: report.timeOfReceipt, from: from});
        }

        function gotoSightingsOfMac(report) {
            var from = moment(report.timeOfReceipt).subtract(1, 'days').toISOString();
            $state.go('sightings.of-mac', { mac: report.sightingId, to: report.timeOfReceipt, from: from});
        }

        function gotoSightingsPivotForDevice(report) {
            $state.go('sightings.pivot', { imei: report.imei, lastReport: report});
        }

        function gotoSeparationSimulator(report) {
            SeparationSelectionService.setSentry(report.imei);
            $state.go('simulators.separation', { imei: report.imei, lastReport: report});
        }

        function next() {
            if (vm.page !== vm.totalPages) {
                gotoPage(vm.page + 1);
            }
        }

        function previous() {
            if (vm.page !== 1) {
                gotoPage(vm.page - 1);
            }
        }

        function gotoPage(page) {
            $rootScope.loading = true;
            if (page < 1 || page > vm.totalPages) {
                return;
            }
            vm.list = null;
            vm.page = page;
            vm.errorMessage = null;

            var listPromise;

            if (vm.currentPageView.name === 'latest') {
                listPromise =
                    SightingsAdminApiService.latestSightings(SentinelUiSession.focus, vm.page).$promise ;
            } else {
                var from;
                var to;

                if (vm.currentPageView.name === 'hours') {
                    from = moment().subtract(vm.hoursText, 'hour');
                    to = moment();
                } else {
                    from = moment(vm.fromText);
                    to = moment(vm.toText);
                }

                listPromise = 
                    SightingsAdminApiService.listSightings(SentinelUiSession.focus, from, to, vm.page).$promise;
            }

            listPromise.then(
                function(result) {
                    vm.list = result;
                },
                function (error) {
                    console.log(error);
                    vm.list = [];
                    vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function validateDateRange() {
            vm.errorMessage = null;

            var fromDateMoment = moment(vm.fromText, 'YYYY-MM-DDTHH:mm:ss');
            var toDateMoment = moment(vm.toText, 'YYYY-MM-DDTHH:mm:ss');

            if (toDateMoment.isSame(fromDateMoment) || toDateMoment.isBefore(fromDateMoment)) {
                vm.errorMessage = 'End date must be after ' + fromDateMoment.format('L LT');
                return;
            }
        }
    }

})();