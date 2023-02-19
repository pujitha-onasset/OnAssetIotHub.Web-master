(function () {
    'use strict';

    angular
        .module('tracking.ui.shipments.filterbar')
        .directive('shipmentsFilterBar', VisionShipmentsFilterBarDirective);

    function VisionShipmentsFilterBarDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'shipmentsFilterBar',
            templateUrl: 'tracking-ui-shipments-filterbar/shipments-filterbar-directive.html',
        };
        return directive;
    }

    ThisDirectiveController.$inject = ['$scope', '$state', 'ShipmentsFilterService'];
    function ThisDirectiveController($scope, $state, ShipmentsFilterService) {
        var vm = {
            filter: ShipmentsFilterService,
            showListFilterOptions: false,
            showReportFilterOptions: false,
            showOriginDestinationOptions: false,
            toggleProperty: toggleProperty,
            resetPropertyFilter: resetPropertyFilter,
            navToShipmentsMap: navToShipmentsMap,
            navToShipmentMap: navToShipmentMap,
            navToShipmentsReports: navToShipmentsReports,
            navToShipmentReports: navToShipmentReports            
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////

        function activate() {
            vm.showReportFilterOptions = $state.current.name !== 'shipments.list';
            vm.showListFilterOptions = $state.current.name === 'shipments.list';
            vm.showOriginDestinationOptions = $state.current.name !== 'shipment.map' && $state.current.name !== 'shipment.reports' ;

            $scope.$on('$stateChangeSuccess', function () {
                vm.showReportFilterOptions = $state.current.name !== 'shipments.list';
                vm.showListFilterOptions = $state.current.name === 'shipments.list';
                vm.showOriginDestinationOptions = $state.current.name !== 'shipment.map' && $state.current.name !== 'shipment.reports' ;
            });
        }

        function resetPropertyFilter() {
            vm.filter.range.above = vm.filter.range.min;
            vm.filter.range.below = vm.filter.range.max;
            vm.filter.range.from = vm.filter.range.min;
            vm.filter.range.to = vm.filter.range.max;
            $('#btn-reset-property').blur();
        }

        function toggleProperty() {
            vm.filter.range.enabled = !vm.filter.range.enabled;
            $('#btn-property').blur();
        }

        function navToShipmentsMap() {
            $state.go('shipments.map');
        }

        function navToShipmentMap() {
            $state.go('shipment.map', { shipmentId: $state.params.shipmentId });
        }

        function navToShipmentsReports() {
            $state.go('shipments.reports');
        }

        function navToShipmentReports() {
            $state.go('shipment.reports', { shipmentId: $state.params.shipmentId });
        }        

    }
})();