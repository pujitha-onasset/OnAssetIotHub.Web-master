(function () {
    'use strict';

    angular
        .module('ui-rls.recovery')
        .directive('recoveryFilterBar', recoveryFilterBarDirective);

    function recoveryFilterBarDirective() {
        var directive = {
            restrict: 'A',
            controller: RecoveryFilterController,
            controllerAs: 'recoveryFilterBar',
            templateUrl: 'ui-rls-recovery/recovery-filterbar-directive.html',
        };
        return directive;
    }

    RecoveryFilterController.$inject = ['$scope', '$state', '$controller', 'RecoveryFilterService', 'RecoveryDataService'];
    function RecoveryFilterController($scope, $state, $controller, RecoveryFilterService, RecoveryDataService) {
        var vm = {
            filter: RecoveryFilterService,
            data: RecoveryDataService,
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////

        function activate() {
        }
    }
})();