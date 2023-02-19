(function () {
    'use strict';

    angular
        .module('ui-rls.exceptions')
        .directive('exceptionsFilterBar', exceptionsFilterBarDirective);

    function exceptionsFilterBarDirective() {
        var directive = {
            restrict: 'A',
            controller: ExceptionsFilterController,
            controllerAs: 'exceptionsFilterBar',
            templateUrl: 'ui-rls-exceptions/exceptions-filterbar-directive.html',
        };
        return directive;
    }

    ExceptionsFilterController.$inject = ['$scope', '$state', '$controller', 'ExceptionsFilterService', 'ExceptionsDataService'];
    function ExceptionsFilterController($scope, $state, $controller, ExceptionsFilterService, ExceptionsDataService) {
        var vm = {
            filter: ExceptionsFilterService,
            data: ExceptionsDataService,
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////

        function activate() {
        }
    }
})();