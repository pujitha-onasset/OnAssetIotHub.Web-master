(function () {
    'use strict';

    angular
        .module('ui-rls.recovery')
        .factory('RecoveryDataService', RecoveryDataService);

    RecoveryDataService.$inject = ['$rootScope', 'RlsUiSession','DeviceRecoveryService',  'FeedbackService'];
    function RecoveryDataService( $rootScope, RlsUiSession, DeviceRecoveryService,  FeedbackService) {
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
                var promise = DeviceRecoveryService.getDeviceRecoveryList(RlsUiSession.focus,service.fromText, service.toText,"recoverylist").$promise;

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
