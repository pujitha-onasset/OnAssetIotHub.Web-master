(function () {
    'use strict';

    angular
        .module('ui-sentinel.sentry-commands')
        .config(routes);

    routes.$inject = ['$stateProvider'];
    function routes($stateProvider) {
        $stateProvider
            .state('sentry-commands', {
                abstract: true,
                url: '/sentry-commands',
                template: '<ui-view/>',
                data: {
                    authorizationRequired: true,
                    pageTitle: 'Sentry Commands',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('sentry-commands.queue', {
                url: '/{imei}/queue',
                templateUrl: 'ui-sentinel-sentry-commands/sentry-commands-queue.html',
                data: {
                    subTitle: 'Queue'
                }
            })
            .state('sentry-commands.log', {
                url: '/{imei}/log',
                templateUrl: 'ui-sentinel-sentry-commands/sentry-commands-log.html',
                data: {
                    subTitle: 'Log'
                }
            })
        ;
    }

})();