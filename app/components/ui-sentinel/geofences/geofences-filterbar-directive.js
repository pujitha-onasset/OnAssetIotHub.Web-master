(function () {
    'use strict';

    angular
        .module('ui-sentinel.geofences')
        .directive('geofencesFilterBar', GeofencesFilterBarDirective);

    function GeofencesFilterBarDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'geofencesFilterBar',
            templateUrl: 'ui-sentinel-geofences/geofences-filterbar-directive.html',
        };
        return directive;
    }

    ThisDirectiveController.$inject = ['$scope', '$state', 'GeofencesFilterService'];
    function ThisDirectiveController($scope, $state, GeofencesFilterService) {
        var vm = {
            filter: GeofencesFilterService,
            toggleShowPolygons: toggleShowPolygons,
            toggleShowRadials: toggleShowRadials
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////

        function activate() {
        }

        function toggleShowPolygons() {
            vm.filter.showPolygons = !vm.filter.showPolygons;
            $('#btn-show-polygons').blur();
        }

        function toggleShowRadials() {
            vm.filter.showRadials = !vm.filter.showRadials;
            $('#btn-show-radials').blur();
        }
    }
})();