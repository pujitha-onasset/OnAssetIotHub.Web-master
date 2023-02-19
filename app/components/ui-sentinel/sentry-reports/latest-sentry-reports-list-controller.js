(function() {
    'use strict';

    angular
        .module('ui-sentinel.sentry-reports')
        .controller('LatestSentryReportsController', LatestSentryReportsController);

    /////////////

    LatestSentryReportsController.$inject = ['$rootScope', '$state','$q', 'SentinelUiSession', 'SentryAdminApiService', 'SentryAccountApiService', 'SeparationSelectionService'];
    function LatestSentryReportsController($rootScope, $state, $q, SentinelUiSession, SentryAdminApiService, SentryAccountApiService, SeparationSelectionService) {
        var pageViews = [
            {
                name: 'latest',
                title: 'Latest Reports',
                icon: 'fa-clock-o'
            },
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
            page: 1,
            totalPages: 1,
            totalItems: 0,
            pageArray: null,
            itemsPerPage: 500,
            hoursText: 8,
            fromText: moment().subtract(8, 'hours').format('YYYY-MM-DDTHH:mm:ss'),
            toText: moment().add(1, 'day').format('YYYY-MM-DDTHH:mm:ss'),
            changeView: changeView,
            currentPageView: {
                name: 'latest',
                title: 'Latest Reports',
                icon: 'fa-clock-o'
            },
            pageViews: pageViews,
            load: load,
            gotoDeviceReports: gotoDeviceReports,
            gotoSightingsForReport: gotoSightingsForReport,
            gotoSightingsByDevice: gotoSightingsByDevice,
            gotoSightingsPivotForDevice: gotoSightingsPivotForDevice,
            gotoSeparationSimulator: gotoSeparationSimulator,
            next: next,
            previous: previous,
            gotoPage: gotoPage
        };

        var genericErrorMessage = "Unexpected error ocurred while getting the latest sentry reports";
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

        function retryAction(action, numTries) {
            return $q.when()
                .then(action)
                .catch(function (error) {
                    if (numTries <= 0) {
                        throw error;
                    }
                    return retryAction(action, numTries - 1);
                });
        }

        function load() {
            $rootScope.loading = true;
            vm.list = null;
            vm.page = 1;
            vm.errorMessage = null;

            var countPromise;
            var listPromise;
            if (vm.currentPageView.name === 'latest') {
                countPromise = 
                    SentryAdminApiService.countLatestSentry500SentinelReports(SentinelUiSession.focus).$promise;
                listPromise = 
                    SentryAdminApiService.listLatestSentry500SentinelReports(SentinelUiSession.focus, vm.page).$promise ;
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
                    SentryAdminApiService.countSentry500SentinelReports(SentinelUiSession.focus, from, to).$promise ;
                listPromise =
                    SentryAdminApiService.listSentry500SentinelReports(SentinelUiSession.focus, from, to, vm.page).$promise;
            }

            if (!countPromise || !listPromise) {
                return;
            }

            retryAction(function () { return countPromise; }, 3).then(
                function(result) {
                    vm.totalPages = result.pageCount;
                    vm.totalItems = result.itemCount;

                    var pageArray = [];
                    for (var i = 1; i <= vm.totalPages; i++) {
                        pageArray.push(i);
                    }
                    vm.pageArray = pageArray;

                },function(error) {
                    console.log(error);
                    vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                }
            );

            retryAction(function () { return listPromise; }, 3).then(
                function(result) {
                    console.log("result",result);
                    $rootScope.loading = false;
                    vm.list = result;
                },function (error) {
                    $rootScope.loading = false;
                    console.log(error);
                    vm.list = [];
                    vm.errorMessage = (typeof error.data !== 'undefined' && typeof error.data.message !== 'undefined') ? error.data.message : genericErrorMessage;
                }
            );
        }

        function gotoDeviceReports(report) {
            var from = moment(report.timeOfReceipt).subtract(1, 'days').toISOString();
            var to = moment(report.timeOfReceipt).add(1, 'days').toISOString();
            $state.go('sentry-reports.by-device', { imei: report.imei, view: 'prior', to: to, from: from});
        }

        function gotoSightingsForReport(report) {
            $state.go('sightings.for-report', { reportId: report.sentryStatusId, report: report});
        }

        function gotoSightingsByDevice(report) {
            var from = moment(report.timeOfReceipt).subtract(1, 'days').toISOString();
            var to = moment(report.timeOfReceipt).add(1, 'days').toISOString();
            $state.go('sightings.by-device', { imei: report.imei, to: to, from: from});
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


            $rootScope.loading = true;
            vm.list = null;
            vm.page = page;
            vm.errorMessage = null;
            var from;
            var to;
            if (vm.currentPageView.name === 'latest') {
                listPromise = 
                    SentryAdminApiService.listLatestSentry500SentinelReports(SentinelUiSession.focus, vm.page).$promise ;
            }else{
                if (vm.currentPageView.name === 'hours') {
                    from = moment().subtract(vm.hoursText, 'hour');
                    to = moment();
                }
                else {
                    from = moment(vm.fromText);
                    to = moment(vm.toText);
                }
                var listPromise =
                    SentryAdminApiService.listSentry500SentinelReports(SentinelUiSession.focus, from, to, vm.page).$promise;                
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
    }

})();