(function() {
    'use strict';

    angular
        .module('tracking')
        .run(runBlock);

    ////////////////////////
    runBlock.$inject = ['$rootScope', '$state', '$stateParams', '$location', '$window'];
    function runBlock($rootScope,$state, $stateParams, $location, $window) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        onStartUp();

        $rootScope.$on('$stateChangeSuccess', onStateChangeSuccess);
        $rootScope.$on('$stateChangeStart', onStateChangeStart);

        var locale = window.navigator.userLanguage || window.navigator.language;
        moment.locale(locale);
        $.datepicker.setDefaults($.datepicker.regional[locale]);

        //////////////////////////////////////////////////////////////////

        function onStartUp() {
            var absUrl = $location.absUrl();
            var hasParamT = absUrl.indexOf('t=') > -1;
            if (hasParamT) {
                var paramT = absUrl.split('t=')[1].split('#')[0];
                $state.go('home', {t: paramT});
                return;
            }

            $state.go('home');
        }


        function onStateChangeSuccess (event, toState, toParams, fromState, fromParams) {
            // if (toParams) {
            //     localStorageService.set('reloadState', toState.name);
            //     localStorageService.set('reloadParams', toParams);
            // }
            // else {
            //     localStorageService.set('reloadState', null);
            //     localStorageService.set('reloadParams', null);
            // }
        }

        function onStateChangeStart (event, toState, toParams, fromState, fromParams) {

            
            // console.log(toState);
            // console.log(toParams);
            //
            // var reloadState = localStorageService.set('reloadState');
            // var reloadStateParams = localStorageService.set('reloadParams');
            //
            // if (reloadState && reloadState === toState.name && !toParams) {
            //     toParams = reloadStateParams;
            // }
            //
            // if (reloadState !== null) {
            //     $state.go(reloadState, reloadParams);
            // }
            // else {
            //     $state.go('home');
            // }

        }


    }
})();