(function () {
    'use strict';

    angular
        .module('ui-sentinel.shipments.shipmentReportToolItem')
        .directive('shipmentReportToolItem', ShipmentReportToolItemDirective);

    function ShipmentReportToolItemDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'shipmentReportToolItem',
            templateUrl: 'ui-sentinel-shipments-shipment-report-tool-item/shipment-report-tool-item-directive.html',
            scope: {
                listItemReport: '=',
                listItemProperty: '=',
                listItemSuffix: "="
            }
        };
        return directive;
    }

    
    //TODO: fix dependency on ShipmentLatestReportsService
    ThisDirectiveController.$inject = ['$scope', 'LatestDeviceTrackingReportsService'];
    function ThisDirectiveController($scope, LatestDeviceTrackingReportsService) {
        var vm = {
            listItemClicked: listItemClicked
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////

        function activate() {
        }

        function listItemClicked() {
            LatestDeviceTrackingReportsService.selected = $scope.listItemReport;
        }

    }
})();