(function() {
    'use strict';

    angular
        .module('ui-sentinel.assets')
        .controller('AssetListController', AssetListController);

    AssetListController.$inject = ['$rootScope', '$scope', '$state', 'SentinelUiSession', 'AssetsDataService', 'AssetsFilterService', 'FeedbackService'];
    function AssetListController($rootScope, $scope, $state, SentinelUiSession, AssetsDataService, AssetsFilterService, FeedbackService) {
        var vm = {
            assets: AssetsDataService,
            filterService: AssetsFilterService,
            feedback: FeedbackService,
            session: SentinelUiSession,
            hasPermission: {
                toAdd: false,
                toAddCalibration: false,
                toViewCalibrations: false,
            },
            actions: {
                create: function() {
                    $state.go('assets.new');
                }
            },
            goToAddCalibration: goToAddCalibration,
            goToViewCalibrations: goToViewCalibrations,
            propertyName: 'assetName',
            reverse: false,
            sortBy: sortBy,
        };
        activate();
        return vm;

        function activate() {
            vm.feedback.clear();

            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'assets.list') {
                   
                }
            });

             vm.assets.load();

            setPermissions();
        }

        function setPermissions() {
            vm.hasPermission.toAdd =
                SentinelUiSession.user.isSystemAdmin || SentinelUiSession.user.isAccountAdmin;

            vm.hasPermission.toAddCalibration =
                SentinelUiSession.user.isSystemAdmin || SentinelUiSession.user.isAccountAdmin;

            vm.hasPermission.toViewCalibrations =
                SentinelUiSession.user.isSystemAdmin || SentinelUiSession.user.isAccountAdmin || SentinelUiSession.user.isAccountEditor;
        }

        function goToAddCalibration(asset) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('calibrations.new', { sentinelId: asset.sentinelId, referrer: returnState, referrerParams: returnStateParams, asset: asset } );
        }

        function goToViewCalibrations(asset) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('calibrations.list', { sentinelId: asset.sentinelId, referrer: returnState, referrerParams: returnStateParams, asset: asset } );
        }

        function sortBy(propertyName) {
            vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
        }
    }
})();

