(function() {
    'use strict';

    angular
        .module('ui-sentinel.geofences')
        .config(routes);

    routes.$inject = ['$stateProvider', 'SENTINEL_API_HOST_CONSTANTS'];
    function routes($stateProvider, USER_ROLES) {
        $stateProvider
            .state('geofences', {
                abstract: true,
                url: '/geofences',
                template: '<ui-view/>',
                params: {
                    isRlsRoute: false,
                    rlsAuthorizationRequired: false
                },
                data: {
                   // isRlsRoute: true,
                   // rlsAuthorizationRequired: true,
                    authorizationRequired: true,
                    authorizedRoles: [
                        USER_ROLES.systemAdmin,
                        USER_ROLES.supportAdmin,
                        USER_ROLES.supportObserver,
                        USER_ROLES.accountAdmin,
                        USER_ROLES.accountEditor
                    ],
                    pageTitle: 'Manage Geofences',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('geofences.list', {
                url: '/list',
                templateUrl: 'ui-sentinel-geofences/geofences-list.html'
            })
            .state('geofences.map', {
                url: '/map',
                templateUrl: 'ui-sentinel-geofences/geofences-map.html'
            })
            .state('geofence', {
                abstract: true,
                url: '/geofences',
                template: '<ui-view>',
                params: {
                    isRlsRoute: false,
                    rlsAuthorizationRequired: false
                },
                data: {
                   // isRlsRoute: true,
                    //rlsAuthorizationRequired: true,
                    authorizationRequired: true,
                    authorizedRoles: [
                        USER_ROLES.systemAdmin,
                        USER_ROLES.supportAdmin,
                        USER_ROLES.supportObserver,
                        USER_ROLES.accountAdmin,
                        USER_ROLES.accountEditor
                    ],
                    pageTitle: 'Manage Geofences',
                    subTitle: null,
                    parentState: 'geofences.list'
                }
            })
            .state('geofence.radialNew', {
                url: '/radial/new',
                templateUrl: 'ui-sentinel-geofences/geofence-radial-admin.html',
                params: {
                    referrer: 'geofences.list',
                    referrerParams: null,
                },
                data: {
                    subTitle: 'Create a new radial geofence'
                }
            })
            .state('geofence.radial', {
                url: '/radial/:geofenceId/admin',
                templateUrl: 'ui-sentinel-geofences/geofence-radial-admin.html',
                params: {
                    referrer: 'geofences.list',
                    referrerParams: null,
                }
            })
            .state('geofence.polygon', {
                url: '/polygon/:geofenceId/admin',
                templateUrl: 'ui-sentinel-geofences/geofence-polygon-admin.html',
                params: {
                    referrer: 'geofences.list',
                    referrerParams: null,
                }
            })
            .state('geofence.polygonNew', {
                url: '/polygon/new',
                templateUrl: 'ui-sentinel-geofences/geofence-polygon-admin.html',
                params: {
                    referrer: 'geofences.list',
                    referrerParams: null,
                },
                data: {
                    subTitle: 'Create a new polygon geofence'
                }
            });
    }
})();