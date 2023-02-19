(function () {
    'use strict';

    angular
        .module('ui-rls.exceptions')
        .factory('ExceptionsDataService', ExceptionsDataService);

    ExceptionsDataService.$inject = ['$rootScope', 'RlsUiSession','DeviceRecoveryService',  'FeedbackService'];
    function ExceptionsDataService( $rootScope, RlsUiSession, DeviceRecoveryService,  FeedbackService) {
        var service = {
            all: [],
            feedback: FeedbackService,
            load: load,
            fromText: moment().subtract(44, 'days').format('YYYY-MM-DDTHH:mm:ss'),
            toText: moment().add(1, 'day').format('YYYY-MM-DDTHH:mm:ss'),
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

            if (typeof service.fromText != 'undefined' && typeof service.toText != 'undefined') {
                var promise = DeviceRecoveryService.getDeviceRecoveryList(RlsUiSession.focus, service.fromText, service.toText, 'exceptions').$promise;

                promise.then(
                    function(result) {
                        //console.log(result);
                        service.all = result;
                        
                    },
                    function (error) {
                        console.log(error);
                        service.feedback.addError(error.data.message);
                    }
                ).finally(function(){
                    $rootScope.loading = false;
                });
            } else {
                $rootScope.loading = false;
            }
        }
    }
})();
