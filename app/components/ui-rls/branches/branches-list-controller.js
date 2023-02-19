(function() {
    'use strict';

    angular
        .module('ui-rls.branches')
        .controller('BranchListController', BranchListController);

    BranchListController.$inject = ['$rootScope', '$scope', '$state', 'RlsUiSession', 'BranchesDataService', 'BranchesFilterService', 'FeedbackService'];
    function BranchListController($rootScope, $scope, $state, RlsUiSession, BranchesDataService, BranchesFilterService, FeedbackService) {
        var vm = {
            branches: BranchesDataService,
            filterService: BranchesFilterService,
            feedback: FeedbackService,
            hasPermission: {
                toAdd: false
            },
            actions: {
                create: function() {
                    $state.go('branches.new');
                }
            },
            propertyName: 'name',
            reverse: false,
            sortBy: sortBy,
        };
        activate();
        return vm;

        function activate() {
            vm.feedback.clear();

            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'branches.list') {
                    BranchesDataService.load();
                }
            });
            BranchesDataService.load();
            setPermissions();
        }
        
        function setPermissions() {
            vm.hasPermission.toAdd =
                RlsUiSession.user.isSystemAdmin || RlsUiSession.user.isAccountAdmin;
        }

        function sortBy(propertyName) {
            vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
        }
    }
})();

