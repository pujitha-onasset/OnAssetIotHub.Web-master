(function () {
    'use strict';

    angular
        .module('ui-sentinel.sentinel')
        .config(routes);

    routes.$inject = ['$stateProvider'];
    function routes($stateProvider) {
        $stateProvider
            .state('sentinel-admin', {
                abstract: true,
                url: '/sentinel-admin',
                template: '<ui-view/>',
                data: {
                    authorizationRequired: true,
                    pageTitle: 'Sentinel Admin',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('sentinel-admin.list', {
                url: '/list',
                templateUrl: 'ui-sentinel-sentinel/sentinel-admin-list.html'
            })
            .state('sentinel-assignment', {
                abstract: true,
                url: '/sentinels',
                template: '<ui-view/>',
                data: {
                    authorizationRequired: true,
                    pageTitle: 'Sentinels',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('sentinel-assignment.list', {
                url: '/list',
                templateUrl: 'ui-sentinel-sentinel/sentinel-assignment-list.html'
            })
        ;
    }

})();