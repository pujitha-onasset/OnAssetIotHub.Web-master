(function() {
    'use strict';

    angular
        .module('tracking.ui.theme')
        .config(routes);

    routes.$inject = ['$stateProvider'];
    function routes($stateProvider) {
        $stateProvider
            .state('home', {
                url: '/track?t',
                templateUrl: 'tracking-ui-theme/theme-home.html',
                params: {
                    t: null
                }
            })
            .state('help', {
                url: '/help',
                templateUrl: 'tracking-ui-theme/theme-help.html'
            })
        ;
    }
})();
