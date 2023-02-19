(function () {
    'use strict';

    angular
        .module('ui-sentinel.sentry-configs')
        .config(routes);

    routes.$inject = ['$stateProvider'];
    function routes($stateProvider) {
        $stateProvider
            .state('sentry-configs', {
                abstract: true,
                url: '/sentry-configs',
                template: '<ui-view/>',
                data: {
                    authorizationRequired: true,
                    pageTitle: 'Sentry Configs',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('sentry-configs.by-device', {
                url: '/{assignmentAccountId}/{imei}',
                templateUrl: 'ui-sentinel-sentry-configs/sentry-configs-by-device.html',
                data: {
                    subTitle: 'By Device'
                }
            })
        ;
    }

})();