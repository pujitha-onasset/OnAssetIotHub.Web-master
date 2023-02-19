(function() {
    'use strict';

    angular
        .module('ui-rls.exceptions')
        .config(routes);

    routes.$inject = ['$stateProvider', 'SENTINEL_API_HOST_CONSTANTS'];
    function routes($stateProvider, USER_ROLES) {
        $stateProvider
            .state('exceptions', {
                abstract: true,
                url: '/exceptions',
                template: '<ui-view/>',
                data: {
                    isRlsRoute: true,
                    rlsAuthorizationRequired: true,
                    pageTitle: 'Manage Exceptions',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('exceptions.list', {
                url: '/list',
                templateUrl: 'ui-rls-exceptions/exceptions-list.html'
            });
    }
})();