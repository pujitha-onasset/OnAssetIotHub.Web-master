(function () {
    'use strict';

    angular
        .module('ui-sentinel.calibrations')
        .directive('calibrationsFilterBar', calibrationsFilterBarDirective);

    function calibrationsFilterBarDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'calibrationsFilterBar',
            templateUrl: 'ui-sentinel-calibrations/calibrations-filterbar-directive.html',
        };
        return directive;
    }

    ThisDirectiveController.$inject = ['$scope', '$state', 'CalibrationsFilterService'];
    function ThisDirectiveController($scope, $state, CalibrationsFilterService) {
        var vm = {
            filter: CalibrationsFilterService
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////

        function activate() {
        }
    }
})();