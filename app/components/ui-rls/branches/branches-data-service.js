(function () {
    'use strict';

    angular
        .module('ui-rls.branches')
        .factory('BranchesDataService', BranchesDataService);

    BranchesDataService.$inject = ['$rootScope', 'RlsUiSession','BranchService',  'FeedbackService'];
    function BranchesDataService( $rootScope, RlsUiSession, BranchService,  FeedbackService) {
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
            console.log(RlsUiSession);
            var promise = BranchService.getBranches(RlsUiSession.focus).$promise;
            promise.then(
                function(result) {
                    service.all = result;
                    $rootScope.loading = false;
                },
                function (error) {
                    service.feedback.addError(error.data.message);
                    $rootScope.loading = false;
                }
            );

            
        }
    }
})();
