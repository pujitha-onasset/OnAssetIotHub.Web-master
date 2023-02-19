(function () {
    'use strict';

    angular
        .module('ui-sentinel.shipments.latestShipmentTracking')
        .controller('LatestShipmentTrackingListController', LatestShipmentTrackingListController);

    LatestShipmentTrackingListController.$inject = ['$rootScope', '$scope', '$state', 'LatestShipmentTrackingReportsService', 'LatestShipmentTrackingFilterService', 'UomSecondsConverter', 'SentryReportColumnSelectorService'];
    function LatestShipmentTrackingListController($rootScope, $scope, $state, LatestShipmentTrackingReportsService, LatestShipmentTrackingFilterService, UomSecondsConverter, SentryReportColumnSelectorService) {

        var vm = {
            columns: SentryReportColumnSelectorService,
            reportsService: LatestShipmentTrackingReportsService,
            filterService: LatestShipmentTrackingFilterService,
            secondsService: UomSecondsConverter,
            selectReport: selectReport,
            selectedGuid: null,
            goToShipmentMap: goToShipmentMap,
            goToShipmentAdmin: goToShipmentAdmin,
            goToShipmentReports: goToShipmentReports
        };
        activate();
        return vm;

        function activate() {
            setPermissions();
            vm.selectedGuid = vm.reportsService.selected ? vm.reportsService.selected.reportGuid : null;
            vm.reportsService.load(vm.reportsService.fromDate, vm.reportsService.toDate);

            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'shipments.reports') {
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
                    if ($rootScope.$state.current.name !== 'shipments.reports') {
                        return;
                    }

                    vm.filterService.save();
                }, true
            );
        }

        function goToShipmentMap(report) {
            if (report) {
                $state.go('shipment.map',{ shipmentId: report.shipment.shipmentId, referrer: 'shipments.reports' });
            }
        }

        function goToShipmentReports(report) {
            if (report) {
                $state.go('shipment.reports',{ shipmentId: report.shipment.shipmentId, referrer: 'shipments.reports'  });
            }
        }

        function goToShipmentAdmin(report) {
            if (report) {
                $state.go('shipment.admin',{ shipmentId: report.shipment.shipmentId, referrer: 'shipments.reports' });
            }
        }

        function setPermissions() {

        }

        function selectReport(report) {
            vm.reportsService.selected = vm.reportsService.selected === report ? null : report;
        }
    }
})();