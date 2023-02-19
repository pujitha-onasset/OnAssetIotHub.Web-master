(function () {
    'use strict';

    angular
        .module('ui-sentinel.accounts')
        .config(routes);

    routes.$inject = ['$stateProvider'];
    function routes($stateProvider) {
        $stateProvider
            .state('accounts', {
                abstract: true,
                url: '/accounts',
                template: '<ui-view/>',
                data: {
                    authorizationRequired: true,
                    pageTitle: 'Accounts',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('accounts.list', {
                url: '/list',
                templateUrl: 'ui-sentinel-accounts/accounts-list.html'
            })
        ;
    }

})();