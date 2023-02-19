(function () {
    'use strict';

    angular
        .module('ui-sentinel.shipments.shipmentTracking')
        .controller('ShipmentTrackingListController', ShipmentTrackingListController);

    ShipmentTrackingListController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'ShipmentTrackingReportsService', 'ShipmentTrackingFilterService', 'ShipmentListService', 'UomSecondsConverter', 'SentryReportColumnSelectorService'];
    function ShipmentTrackingListController($rootScope, $scope, $state, $stateParams, ShipmentTrackingReportsService, ShipmentTrackingFilterService, ShipmentListService, UomSecondsConverter, SentryReportColumnSelectorService) {

        var vm = {
            columns: SentryReportColumnSelectorService,
            shipment: null,
            reportsService: ShipmentTrackingReportsService,
            filterService: ShipmentTrackingFilterService,
            secondsService: UomSecondsConverter,
            selectReport: selectReport,
            selectedGuid: null,
            goToDeviceAdmin: goToDeviceAdmin,
            gotoSightingsForReport: gotoSightingsForReport
        };
        activate();
        return vm;

        function activate() {
            setPermissions();
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'shipment.reports') {
                    $state.go('shipments.reports');
                }
                vm.reportsService.clear();
            });

            $scope.$watch(
                function() {
                    return vm.reportsService.selected;
                },
                function (report) {
                    vm.selectedGuid = report ? report.reportGuid : null;
                }, true
            );

            $scope.$watch(
                function() {
                    return vm.filterService;
                },
                function () {
                    if ($rootScope.$state.current.name !== 'shipment.reports') {
                        return;
                    }

                    vm.filterService.save();
                }, true
            );

            var shipmentId = $stateParams.shipmentId;
            loadShipment(shipmentId);

            if (shipmentId !== vm.reportsService.shipmentId) {
                vm.reportsService.init(shipmentId);
            }
        }

        function goToDeviceAdmin(report) {
            console.log("goToDeviceAdmin",report);
            if (report) {
                $state.go('device.admin',{ deviceTagId: report.deviceTagId, referrer: 'shipment.reports', referrerParams: { shipmentId: vm.shipment.shipmentId } });
            }
        }

        function gotoSightingsForReport(report) {
            if (report) {
                $state.go('sightings.for-report', { reportId: report.reportGuid,from:vm.reportsService.fromDate.toISOString(), to:vm.reportsService.toDate.toISOString()  });
            }
        }

        function loadShipment(shipmentId) {
            $rootScope.loading = true;
            var promise = ShipmentListService.getShipmentListItem(shipmentId).$promise;
            promise.then(
                function (result) {
                    $rootScope.loading = false;
                    $state.current.data.subTitle = result.referenceNumber;
                    vm.shipment = result;
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function setPermissions() {

        }

        function selectReport(report) {
            vm.reportsService.selected = vm.reportsService.selected === report ? null : report;
        }        
    }

})();