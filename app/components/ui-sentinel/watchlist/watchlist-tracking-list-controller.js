(function () {
    'use strict';

    angular
        .module('ui-sentinel.watchlist')
        .controller('WatchlistTrackingListController', WatchlistTrackingListController);

    WatchlistTrackingListController.$inject = ['$rootScope', '$scope', '$state', 'SentinelUiSession','WatchlistTrackingReportsService', 'WatchlistTrackingFilterService', 'UomSecondsConverter', 'WatchlistReportColumnSelectorService','localStorageService'];
    function WatchlistTrackingListController($rootScope, $scope, $state, SentinelUiSession, WatchlistTrackingReportsService, WatchlistTrackingFilterService, UomSecondsConverter, WatchlistReportColumnSelectorService,localStorageService) {

        var vm = {
            columns: WatchlistReportColumnSelectorService,
            reportsService: WatchlistTrackingReportsService,
            filterService: WatchlistTrackingFilterService,
            secondsService: UomSecondsConverter,
            selectReport: selectReport,
            selectedGuid: null,
            goToMap: goToMap,
            goToDeviceAdmin: goToDeviceAdmin,
            goToReports: goToReports,

        };
        activate();
        return vm;

        function activate() {
            setPermissions();
            vm.selectedGuid = vm.reportsService.selected ? vm.reportsService.selected.reportGuid : null;
           // vm.reportsService.load(vm.reportsService.watchlist,vm.reportsService.fromDate, vm.reportsService.toDate);
            if(vm.reportsService.watchlist==null){
               var watchlist = localStorageService.get("watchlist");
               if(watchlist)
                  vm.reportsService.load(watchlist,vm.reportsService.fromDate, vm.reportsService.toDate);
            }
            

            $scope.$watch(
                function() {
                    return vm.reportsService.selected;
                },
                function (report) {
                    //vm.selectedGuid = report ? report.reportGuid : null;
                }, true
            );
            $scope.$watch(
                function() {
                    return vm.filterService;
                },
                function () {
                    if ($rootScope.$state.current.name !== 'watchlist.reports') {
                        return;
                    }

                    vm.filterService.save();
                }, true
            );
        }


        function goToMap(report) {
            if (report) {
                $state.go('device.map',{ deviceTagId: report.deviceTagId, referrer: 'devices.reports'  });
            }
        }

        function goToReports(report) {
            var from = null;
            if (report && report.type === "Sentry") {
                from = moment().subtract(30, 'days').toISOString();
                var to = moment().toISOString();
                $state.go('sentry-reports.by-device', { imei: report.deviceTagId, view: 'prior', to: to, from: from});
                //$state.go('device.reports',{ deviceTagId: report.deviceTagId, referrer: 'devices.reports'  });
            } else if(report && report.type === "Sentinel"){
                from = moment(report.timeOfReceipt).subtract(1, 'days').toISOString();
                $state.go('sightings.of-mac', { mac: report.deviceTagId, to: report.timeOfReceipt, from: from});
            }
        }

        function goToDeviceAdmin(report) {
            if (report && report.type === "Sentry") {
                $state.go('sentry-configs.by-device', { assignmentAccountId: report.accountId, imei: report.deviceTagId });
            }
        }

        function setPermissions() {

        }

        function selectReport(report) {
            vm.reportsService.selected = vm.reportsService.selected === report ? null : report;
        }
    }
})();