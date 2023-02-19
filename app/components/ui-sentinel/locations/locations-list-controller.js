(function() {
    'use strict';

    angular
        .module('ui-sentinel.locations')
        .controller('LocationListController', LocationListController);

    LocationListController.$inject = ['$rootScope', '$scope', '$state', 'SentinelUiSession', 'LocationsDataService', 'LocationsFilterService', 'FeedbackService'];
    function LocationListController($rootScope, $scope, $state, SentinelUiSession, LocationsDataService, LocationsFilterService, FeedbackService) {
        var vm = {
            locations: LocationsDataService,
            filterService: LocationsFilterService,
            feedback: FeedbackService,
            hasPermission: {
                toAdd: false
            },
            actions: {
                create: function() {
                    $state.go('locations.new');
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
                if ($rootScope.$state.current.name == 'locations.list') {
                    LocationsDataService.load();
                }
            });
            LocationsDataService.load();
            setPermissions();
        }
        
        function setPermissions() {
            vm.hasPermission.toAdd =
                SentinelUiSession.user.isSystemAdmin || SentinelUiSession.user.isAccountAdmin;
        }

        function sortBy(propertyName) {
            vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
        }
    }
})();

