(function () {
    'use strict';

    angular
        .module('ui-rls.branches')
        .directive('branchesFilterBar', branchesFilterBarDirective);

    function branchesFilterBarDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'branchesFilterBar',
            templateUrl: 'ui-rls-branches/branches-filterbar-directive.html',
        };
        return directive;
    }

    ThisDirectiveController.$inject = ['$scope', '$state', 'BranchesFilterService'];
    function ThisDirectiveController($scope, $state, BranchesFilterService) {
        var vm = {
            filter: BranchesFilterService
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////

        function activate() {
        }
    }
})();