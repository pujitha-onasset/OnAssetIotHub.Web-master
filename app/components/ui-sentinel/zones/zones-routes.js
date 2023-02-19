(function() {
    'use strict';

    angular
        .module('ui-sentinel.zones')
        .config(routes);

    routes.$inject = ['$stateProvider', 'SENTINEL_API_HOST_CONSTANTS'];
    function routes($stateProvider, USER_ROLES) {
        $stateProvider
            .state('zones', {
                abstract: true,
                url: '/zones',
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
                    pageTitle: 'Manage Zones',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('zones.list', {
                url: '/list',
                templateUrl: 'ui-sentinel-zones/zones-list.html'
            })
            .state('zones.tracking', {
                url: '/:locationId/tracking',
                templateUrl: 'ui-sentinel-zones/zones-tracking.html',
                data: {
                    pageTitle: 'Zones Tracking'
                }
            })
            .state('zone', {
                abstract: true,
                url: '/zone',
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
                    pageTitle: 'Manage Zones',
                    subTitle: null,
                    parentState: 'zones.list'
                }
            })
            .state('zone.tracking-detail', {
                url: '/:locationId/tracking/:zoneId/detail',
                templateUrl: 'ui-sentinel-zones/zone-tracking-detail.html',
                data: {
                    pageTitle: 'Zones Tracking Detail'
                }
            })
            .state('zone.new', {
                url: '/:locationId/new',
                templateUrl: 'ui-sentinel-zones/zone-admin.html',
                params: {
                    referrer: 'zones.list',
                    referrerParams: null,
                    clearMessage:true
                },
                data: {
                    subTitle: 'Create a new zone'
                }
            })
            .state('zone.admin', {
                url: '/:zoneId/admin',
                templateUrl: 'ui-sentinel-zones/zone-admin.html',
                params: {
                    referrer: 'zones.list',
                    referrerParams: null,
                    clearMessage:true
                }
            });
    }
})();
