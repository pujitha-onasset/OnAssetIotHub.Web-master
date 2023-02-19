(function() {
    'use strict';

    angular
        .module('ui-sentinel.zones')
        .controller('ZoneListController', ZoneListController);

    ZoneListController.$inject = ['$rootScope', '$scope', '$state', 'SentinelUiSession', 'ZonesDataService', 'ZonesFilterService', 'FeedbackService'];
    function ZoneListController($rootScope, $scope, $state, SentinelUiSession, ZonesDataService, ZonesFilterService, FeedbackService) {
        var vm = {
            zones: ZonesDataService,
            filterService: ZonesFilterService,
            feedback: FeedbackService,
            hasPermission: {
                toAdd: false
            },
            actions: {
                create: function() {
                    $state.go('zones.new');
                }
            },
            propertyName: 'zoneName',
            reverse: false,
            sortBy: sortBy,
        };
        activate();
        return vm;

        function activate() {
            vm.feedback.clear();

            
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'zones.list') {
                    //ZonesDataService.load();
                }
            });

            ZonesDataService.load();
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

