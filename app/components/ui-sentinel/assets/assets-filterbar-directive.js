(function () {
    'use strict';

    angular
        .module('ui-sentinel.assets')
        .directive('assetsFilterBar', assetsFilterBarDirective);

    function assetsFilterBarDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'assetsFilterBar',
            templateUrl: 'ui-sentinel-assets/assets-filterbar-directive.html',
        };
        return directive;
    }

    ThisDirectiveController.$inject = ['$scope', '$state', 'AssetsFilterService'];
    function ThisDirectiveController($scope, $state, AssetsFilterService) {
        var vm = {
            filter: AssetsFilterService
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////

        function activate() {
        }
    }
})();