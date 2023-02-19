(function() {
    'use strict';

    angular
        .module('ui-sentinel.sentry-reports')
        .controller('SentryReportsByDeviceController', SentryReportsByDeviceController);

    /////////////

    SentryReportsByDeviceController.$inject = ['$rootScope', '$state', 'SentinelUiSession', 'SentryAdminApiService', 'SentryAccountApiService', 'SeparationSelectionService', 'DatetimeValidatorService'];
    function SentryReportsByDeviceController($rootScope, $state, SentinelUiSession, SentryAdminApiService, SentryAccountApiService, SeparationSelectionService, DatetimeValidatorService) {
        var pageViews = [
            {
                name: 'hours',
                title: 'Reports in last few hours',
                icon: 'fa-hourglass-o'
            },
            {
                name: 'range',
                title: 'Reports in a date range',
                icon: 'fa-calendar'
            }
        ];
        
        var vm = {
            list: null,
            imei: $state.params.imei,
            page: 1,
            totalPages: 1,
            totalItems: 0,
            pageArray: null,
            itemsPerPage: 500,
            hoursText: 8,
            /*fromText: $state.params.from, //todo: fix when passed in from a report (which is UTC) should be local
            toText: $state.params.to,*/
            fromText: typeof $state.params.from !== 'undefined' && $state.params.from !== null? moment($state.params.from).format('YYYY-MM-DDTHH:mm:ss') : moment().subtract(8, 'hours').format('YYYY-MM-DDTHH:mm:ss'),
            toText: typeof $state.params.to !== 'undefined' && $state.params.to !== null ? moment($state.params.to).format('YYYY-MM-DDTHH:mm:ss') : moment().add(1, 'day').format('YYYY-MM-DDTHH:mm:ss'),
            changeView: changeView,
            currentPageView: {
                name: 'range',
                title: 'Reports in a date range',
                icon: 'fa-calendar'
            },
            pageViews: pageViews,
            load: load,
            next: next,
            previous: previous,
            gotoPage: gotoPage,
            gotoDeviceReports: gotoDeviceReports,
            gotoSightingsForReport: gotoSightingsForReport,
            gotoSightingsByDevice: gotoSightingsByDevice,
            gotoSightingsPivotForDevice: gotoSightingsPivotForDevice,
            gotoSeparationSimulator: gotoSeparationSimulator,
            validateDateRange: validateDateRange,
        };

        var genericErrorMessage = "Unexpected error ocurred while getting the reports by device";
        activate();
        return vm;

        function activate() {
            if ($state.params.view) {
                changeView($state.params.view);
            }
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
            vm.errorMessage = null;
            vm.page = 1;
            if (!vm.imei) {
                return;
            }
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

            var countPromise = 
                SentryAdminApiService.countSentry500SentinelReportsByDevice(SentinelUiSession.focus, vm.imei, from, to).$promise;
            var listPromise = 
                SentryAdminApiService.listSentry500SentinelReportsByDevice(SentinelUiSession.focus, vm.imei, from, to, vm.page).$promise;

            if (!countPromise || !listPromise) {
                return;
            }
            $rootScope.loading = true;

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
                    vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function gotoDeviceReports(report) {
            var from = moment(report.timeOfReport).subtract(1, 'days').toISOString();
            $state.go('sentry-reports.by-device', { imei: report.imei, view: 'prior', to: report.timeOfReport, from: from});
        }

        function gotoSightingsForReport(report) {
            $state.go('sightings.for-report', { reportId: report.sentryStatusId, report: report});
        }

        function gotoSightingsByDevice(report) {
            var from = moment(report.timeOfReport).subtract(1, 'days').toISOString();
            $state.go('sightings.by-device', { imei: report.imei, to: report.timeOfReport, from: from});
        }

        function gotoSightingsPivotForDevice(report) {
            $state.go('sightings.pivot', { imei: report.imei, lastReport: report});
        }

        function gotoSeparationSimulator(report) {
            SeparationSelectionService.setSentry(report.imei);
            $state.go('simulators.separation', { imei: report.imei, lastReport: report});
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
            vm.list = null;
            vm.page = page;
            var from = moment(vm.fromText);
            var to = moment(vm.toText);
            $rootScope.loading = true;
            var listPromise = 
                SentryAdminApiService.listSentry500SentinelReportsByDevice(SentinelUiSession.focus, vm.imei, from, to, vm.page).$promise ;
            listPromise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.list = result;
                },
                function (error) {
                    $rootScope.loading = false;
                    console.log(error);
                }
            );
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