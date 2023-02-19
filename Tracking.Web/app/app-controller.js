(function() {
    'use strict';

    angular
        .module('tracking')
        .controller('TrackingController', TrackingController);

    ////////////////////////////
    TrackingController.$inject = ['$rootScope', '$window', '$timeout'];
    function TrackingController($rootScope, $window, $timeout) {
        var vm = {

        };
        activate();
        return vm;

        /////////////////

        function activate() {
            $rootScope.$on("$locationChangeSuccess", function(){
                $timeout(function() {
                    $window.scrollTo(0,0);
                });
            });
        }
    }
})();

