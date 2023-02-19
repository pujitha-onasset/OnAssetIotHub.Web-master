(function () {
    'use strict';

    angular
        .module('ui-sentinel.locations')
        .directive('locationsFilterBar', locationsFilterBarDirective);

    function locationsFilterBarDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'locationsFilterBar',
            templateUrl: 'ui-sentinel-locations/locations-filterbar-directive.html',
        };
        return directive;
    }

    ThisDirectiveController.$inject = ['$scope', '$state', 'LocationsFilterService'];
    function ThisDirectiveController($scope, $state, LocationsFilterService) {
        var vm = {
            filter: LocationsFilterService
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////

        function activate() {
        }
    }
})();