(function() {
    'use strict';

    angular
        .module('ui-sentinel.geofences')
        .controller('GeofenceListController', GeofenceListController);

    GeofenceListController.$inject = ['$rootScope', '$scope', '$state', 'SentinelUiSession', 'GeofencesDataService', 'GeofencesFilterService', 'FeedbackService', 'RlsUiSession', 'localStorageService'];
    function GeofenceListController($rootScope, $scope, $state, SentinelUiSession, GeofencesDataService, GeofencesFilterService, FeedbackService, RlsUiSession, localStorageService) {
        var vm = {
            geofences: GeofencesDataService,
            filterService: GeofencesFilterService,
            feedback: FeedbackService,
            hasPermission: {
                toAdd: false
            },
            actions: {
                createPolygon: function() {
                    $state.go('geofences.new', { type: 'polygon'} );
                },
                createRadius: function() {
                    $state.go('geofences.new', { type: 'radius'} );
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
                if ($rootScope.$state.current.name == 'geofences.list') {
                    GeofencesDataService.load();
                }
            });
            GeofencesDataService.load();
            setPermissions();
        }

        function setPermissions() {
            var user = localStorageService.get('isRlsRoute') ? RlsUiSession.user : SentinelUiSession.user;
            vm.hasPermission.toAdd =
                user.isSystemAdmin ||
                user.isAccountAdmin;
        }

        function sortBy(propertyName) {
            vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
        }
    }
})();

