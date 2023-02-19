(function () {
    'use strict';

    angular
        .module('ui-sentinel.sentry')
        .config(routes);

    routes.$inject = ['$stateProvider'];
    function routes($stateProvider) {
        $stateProvider
            .state('sentry-admin', {
                abstract: true,
                url: '/sentry-admin',
                template: '<ui-view/>',
                data: {
                    authorizationRequired: true,
                    pageTitle: 'Sentry Admin',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('sentry-admin.list', {
                url: '/list',
                templateUrl: 'ui-sentinel-sentry/sentry-admin-list.html'
            })
            .state('sentry-assignment', {
                abstract: true,
                url: '/sentries',
                template: '<ui-view/>',
                data: {
                    authorizationRequired: true,
                    pageTitle: 'Sentries',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('sentry-assignment.list', {
                url: '/list',
                templateUrl: 'ui-sentinel-sentry/sentry-assignment-list.html'
            })
        ;
    }

})();