(function () {
    'use strict';

    angular
        .module('ui-sentinel.assets')
        .factory('AssetsDataService', AssetsDataService);

    AssetsDataService.$inject = ['$rootScope', 'SentinelUiSession',  'FeedbackService','AssetService'];
    function AssetsDataService( $rootScope, SentinelUiSession,  FeedbackService, AssetService) {
        var service = {
            all: [],
            feedback: FeedbackService,
            load: load
        };
        activate();
        return service;
        
        ////////////////////////
        
        function activate() {
            load();
        }

        function load() {
            service.all = [];
            $rootScope.loading = true;

            var assetPromise = AssetService.getAssets(SentinelUiSession.focus).$promise;
            assetPromise.then(
                function(result) {
                    $rootScope.loading = false;
                    service.all = result;
                },
                function (error) {
                    $rootScope.loading = false;
                    service.feedback.addError(error.data.message);
                }
            );

            
        }
    }
})();