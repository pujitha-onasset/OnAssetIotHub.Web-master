(function() {
    'use strict';

    angular
        .module('ui-sentinel.watchlist')
        .config(routes);

    routes.$inject = ['$stateProvider', 'SENTINEL_API_HOST_CONSTANTS'];
    function routes($stateProvider, USER_ROLES) {
        $stateProvider
            .state('watchlist', {
                abstract: true,
                url: '/watchlist',
                template: '<ui-view/>',
                data: {
                    authorizationRequired: true,
                    authorizedRoles: [
                        USER_ROLES.systemAdmin,
                        USER_ROLES.accountAdmin,
                        USER_ROLES.accountEditor
                    ],
                    pageTitle: 'Watchlists',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('watchlist.tracking', {
                url: '/tracking',
                templateUrl: 'ui-sentinel-watchlist/watchlist-tracking.html',
                data: {
                    pageTitle: 'Watchlist Tracking',
                    parentState: 'watchlist.tracking'
                },
                params:{
                    reload: false
                }
            })
            .state('watchlist.reports', {
                url: '/reports',
                templateUrl: 'ui-sentinel-watchlist/watchlist-tracking-list.html',
                data: {
                    pageTitle: 'Track Watchlist',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('watchlist.list', {
                url: '/:sentinelId',
                templateUrl: 'ui-sentinel-watchlist/watchlist-list.html',
                params: {
                    referrer: 'watchlist',
                    referrerParams: null,
                    clearMessage:true
                }
            })
            .state('watchlist.admin', {
                url: '/:watchlistId/admin',
                templateUrl: 'ui-sentinel-watchlist/watchlist-admin.html',
                params: {
                    referrer: 'watchlist',
                    referrerParams: null,
                    clearMessage:true
                }
            })
            .state('watchlist.data', {
                url: '/:watchlistId/data',
                templateUrl: 'ui-sentinel-watchlist/watchlist-data.html',
                params: {
                    referrer: 'watchlist',
                    referrerParams: null,
                    watchlist: null
                }
            });
    }

})();