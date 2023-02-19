(function () {
    'use strict';

    angular
        .module('ui-sentinel.shipments')
        .factory('ShipmentTemplatesDataLoaderService', ShipmentTemplatesDataLoaderService);

    ShipmentTemplatesDataLoaderService.$inject = ['$rootScope', 'SentinelUiSession', 'ShipmentTemplatesService', 'FeedbackService'];
    function ShipmentTemplatesDataLoaderService($rootScope, SentinelUiSession, ShipmentTemplatesService, FeedbackService) {
        var recordMax = 500;

        var service = {
            isSearchRequired: false,
            totalTemplates: 0,
            templates: [],
            feedback: FeedbackService,
            load: load,
            clear: clear,
            search: searchRecords
        };
        activate();
        return service;

        function activate() {
            load();
        }

        function clear() {
            service.templates = [];
        }

        function load() {
            $rootScope.loading = true;
            service.templates = [];
            service.isSearchRequired = false;
            var totalCountPromise =  (SentinelUiSession.user.isAnAdmin &&
             SentinelUiSession.focus.id==SentinelUiSession.user.accountId) ?
            ShipmentTemplatesService.getTemplatesCount(SentinelUiSession.focus).$promise:
            ShipmentTemplatesService.getTemplatesCountByClient(SentinelUiSession.focus).$promise;
            totalCountPromise.then(
                function(result) {
                    service.totalTemplates = result.count;
                    if (result.count === 0) {
                        $rootScope.loading = false;
                        return;
                    }

                    if (result.count > recordMax) {
                        $rootScope.loading = false;
                        service.isSearchRequired = true;
                        return;
                    }

                    loadRecords();

                },
                function (error) {
                    //service.feedback.addError(error.data.message);
                }
            );
        }

        function loadRecords() {
            var promise = (SentinelUiSession.user.isAnAdmin &&
             SentinelUiSession.focus.id==SentinelUiSession.user.accountId) ? ShipmentTemplatesService.getTemplates(SentinelUiSession.focus, 1, recordMax).$promise:
             ShipmentTemplatesService.getTemplatesByClient(SentinelUiSession.focus, 1, recordMax).$promise;
            promise.then(
                function(result) {
                    service.templates = result;
                },
                function(error) {
                    service.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function searchRecords(searchText, numResults) {
            $rootScope.loading = true;
            service.templates = [];
            if (!searchText) return;

            var promise = ShipmentTemplatesService.searchTemplates(SentinelUiSession.focus, searchText, numResults).$promise;
            promise.then(
                function(result) {
                    service.templates = result;
                },
                function(error) {
                    service.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }
    }

})();