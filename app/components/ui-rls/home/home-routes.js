(function () {
    'use strict';

    angular
        .module('ui-rls.home')
        .config(routes);

    routes.$inject = ['$stateProvider'];
    function routes($stateProvider) {
        $stateProvider
            .state('rlshome', {
                url: '/rls/home',
                templateUrl: 'ui-rls-home/home.html',
                data: {
                    isRlsRoute: true,
                    rlsAuthorizationRequired: true
                }
            })
        ;
    }

})();