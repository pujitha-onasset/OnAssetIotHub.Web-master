(function () {
    'use strict';

    angular
        .module('ui-sentinel.devices.latestDeviceTracking')
        .controller('LatestDeviceTrackingListController', LatestDeviceTrackingListController);

    LatestDeviceTrackingListController.$inject = ['$rootScope', '$scope', '$state', 'SentinelUiSession','LatestDeviceTrackingReportsService', 'LatestDeviceTrackingFilterService', 'UomSecondsConverter', 'SentryReportColumnSelectorService'];
    function LatestDeviceTrackingListController($rootScope, $scope, $state, SentinelUiSession, LatestDeviceTrackingReportsService, LatestDeviceTrackingFilterService, UomSecondsConverter, SentryReportColumnSelectorService) {

        var vm = {
            columns: SentryReportColumnSelectorService,
            reportsService: LatestDeviceTrackingReportsService,
            filterService: LatestDeviceTrackingFilterService,
            secondsService: UomSecondsConverter,
            selectReport: selectReport,
            selectedGuid: null,
            goToDeviceMap: goToDeviceMap,
            goToDeviceAdmin: goToDeviceAdmin,
            goToDeviceReports: goToDeviceReports,
            filterBySentinel: filterBySentinel

        };
        activate();
        return vm;

        function activate() {
            setPermissions();
            vm.selectedGuid = vm.reportsService.selected ? vm.reportsService.selected.reportGuid : null;
            console.log("vm.selectedGuid",vm.selectedGuid);
            vm.reportsService.load(vm.reportsService.fromDate, vm.reportsService.toDate);

            

            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'devices.reports') {
                    vm.reportsService.load(vm.reportsService.fromDate, vm.reportsService.toDate);
                }
            });

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
                    if ($rootScope.$state.current.name !== 'devices.reports') {
                        return;
                    }

                    vm.filterService.save();
                }, true
            );
        }

        function filterBySentinel(){
            return vm.filterService && vm.filterService.filterByDeviceType === 'Sentinel';
        }

        function goToDeviceMap(report) {
            if (report) {
                $state.go('device.map',{ deviceTagId: report.deviceTagId, referrer: 'devices.reports'  });
            }
        }

        function goToDeviceReports(report) {
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