(function () {
    'use strict';

    angular
        .module('ui-sentinel.zones')
        .directive('zonesFilterBar', zonesFilterBarDirective);

    function zonesFilterBarDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'zonesFilterBar',
            templateUrl: 'ui-sentinel-zones/zones-filterbar-directive.html',
        };
        return directive;
    }

    ThisDirectiveController.$inject = ['$scope', '$state', 'ZonesFilterService'];
    function ThisDirectiveController($scope, $state, ZonesFilterService) {
        var vm = {
            filter: ZonesFilterService
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////

        function activate() {
        }
    }
})();