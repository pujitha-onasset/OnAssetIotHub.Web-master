(function () {
    'use strict';

    angular
        .module('ui-sentinel.logins')
        .config(routes);

    routes.$inject = ['$stateProvider'];
    function routes($stateProvider) {
        $stateProvider
            .state('logins', {
                abstract: true,
                url: '/logins',
                template: '<ui-view/>',
                data: {
                    authorizationRequired: true,
                    pageTitle: 'Logins',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('logins.list', {
                url: '/list',
                templateUrl: 'ui-sentinel-logins/logins-list.html'
            })
            .state('logins.username', {
                url: '/changeusername',
                templateUrl: 'ui-sentinel-logins/logins-username.html',
                params: {
                    loginId: null,
                    referrer: 'home',
                    referrerParams: null
                },
                data: {
                    pageTitle: 'Change My Username',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('logins.password', {
                url: '/changepassword',
                templateUrl: 'ui-sentinel-logins/logins-password.html',
                params: {
                    referrer: 'home',
                    referrerParams: null
                },
                data: {
                    pageTitle: 'Change My Password',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('logins.termofservice', {
                url: '/termofservice',
                templateUrl: 'ui-sentinel-logins/logins-termofservice.html',
                params: {
                    referrer: 'home',
                    referrerParams: null
                },
                data: {
                    pageTitle: 'Accept Terms of Service',
                    subTitle: null,
                    parentState: null
                }
            });
    }

})();