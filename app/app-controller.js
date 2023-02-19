(function() {
    'use strict';

    angular
        .module('sentinel.gateway.web')
        .controller('SentinelUiController', SentinelUiController);

    ////////////////////////////
    SentinelUiController.$inject = ['$rootScope', 'localStorageService'];
    function SentinelUiController($rootScope, localStorageService) {
        var vm = {
            isRlsRoute: isRlsRoute,
        };
        init();
        return vm;

        function init() {
            angular.element(document).ready(function () {
                $('#menu, #rlsmenu').metisMenu();
            });
            /*$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
                $('#menu, #rlsmenu').metisMenu();
            });*/
        }

        function isRlsRoute(){
            return localStorageService.get('isRlsRoute');
        }
    }
})();

