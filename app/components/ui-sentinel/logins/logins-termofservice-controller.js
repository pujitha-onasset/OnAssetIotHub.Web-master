(function() {
    'use strict';

    angular
        .module('ui-sentinel.logins')
        .controller('TermOfServiceController', TermOfServiceController);

    TermOfServiceController.$inject = ['$rootScope',"$sce", '$state','$document','$timeout', '$stateParams','localStorageService', 'SentinelUiSession', 'LoginsApiService', 'FeedbackService', 'AccountApiService', 'USER_ROLES'];
    function TermOfServiceController($rootScope,$sce, $state,$document,$timeout, $stateParams,localStorageService, SentinelUiSession, LoginsApiService, FeedbackService, AccountApiService, USER_ROLES) {
        var vm = {
            accept:false,
            actions: {
                submit: submit
            },
            session: SentinelUiSession
        };
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
          
           
        }
        

        function close() {
            $state.go($stateParams.referrer, $stateParams.referrerParams);
        }

      
        function submit() {
            $('#btn-submit').blur();
          
            $rootScope.loading = true;
            var promise = LoginsApiService.agreedEULAA(SentinelUiSession.user).$promise;
            promise.then(
                function(result) {
                    SentinelUiSession.user.isEulaAgreement=result.eulaAgreement;
                    localStorageService.set('user',  SentinelUiSession.user);
                    $state.go('home');
                },
                function (error) {
                    if (error.status === -1) {
                        vm.feedback.addError('Unable to connect to server.  Please try again later.');
                        return;
                    }

                   
                    vm.feedback.addError('Unable to accept terms.  Please try again later or call support.');
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }       
    
    }
})();