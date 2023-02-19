(function() {
    'use strict';

    angular
        .module('ui-sentinel.assets')
        .config(routes);

    routes.$inject = ['$stateProvider', 'SENTINEL_API_HOST_CONSTANTS'];
    function routes($stateProvider, USER_ROLES) {
        $stateProvider
            .state('assets', {
                abstract: true,
                url: '/assets',
                template: '<ui-view/>',
                data: {
                    authorizationRequired: true,
                    authorizedRoles: [
                        USER_ROLES.systemAdmin,
                        USER_ROLES.supportAdmin,
                        USER_ROLES.supportObserver,
                        USER_ROLES.accountAdmin,
                        USER_ROLES.accountEditor
                    ],
                    pageTitle: 'Manage assets',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('assets.list', {
                url: '/list',
                templateUrl: 'ui-sentinel-assets/assets-list.html'
            })
            .state('asset', {
                abstract: true,
                url: '/asset',
                template: '<ui-view/>',
                data: {
                    authorizationRequired: true,
                    authorizedRoles: [
                        USER_ROLES.systemAdmin,
                        USER_ROLES.supportAdmin,
                        USER_ROLES.supportObserver,
                        USER_ROLES.accountAdmin,
                        USER_ROLES.accountEditor
                    ],
                    pageTitle: 'Manage assets',
                    subTitle: null,
                    parentState: 'assets.list'
                }
            })
            .state('asset.new', {
                url: '/new',
                templateUrl: 'ui-sentinel-assets/asset-admin.html',
                params: {
                    referrer: 'assets.list',
                    referrerParams: null,
                    clearMessage:true
                },
                data: {
                    subTitle: 'Create a new asset'
                }
            })
            .state('asset.admin', {
                url: '/:sentinelId/admin',
                templateUrl: 'ui-sentinel-assets/asset-admin.html',
                params: {
                    referrer: 'assets.list',
                    referrerParams: null,
                    clearMessage:true
                }
            })
            .state('asset.details', {
                url: '/:zoneId/:sentinelId/details',
                templateUrl: 'ui-sentinel-assets/asset-view-details.html',
                params: {
                    referrer: 'assets.list',
                    referrerParams: null,
                    clearMessage:true
                },
                data: {
                    subTitle: 'Details'
                }
            });
    }
})();
