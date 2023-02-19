(function() {
    'use strict';

    angular
        .module('ui-sentinel.locations')
        .config(routes);

    routes.$inject = ['$stateProvider', 'SENTINEL_API_HOST_CONSTANTS'];
    function routes($stateProvider, USER_ROLES) {
        $stateProvider
            .state('locations', {
                abstract: true,
                url: '/locations',
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
                    pageTitle: 'Manage Locations',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('locations.list', {
                url: '/list',
                templateUrl: 'ui-sentinel-locations/locations-list.html'
            })
            .state('locations.tracking', {
                url: '/tracking',
                templateUrl: 'ui-sentinel-locations/locations-tracking.html',
                data: {
                    pageTitle: 'Locations Tracking'
                }
            })
            .state('location', {
                abstract: true,
                url: '/locations',
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
                    pageTitle: 'Manage Locations',
                    subTitle: null,
                    parentState: 'locations.list'
                }
            })
            .state('location.new', {
                url: '/new',
                templateUrl: 'ui-sentinel-locations/location-admin.html',
                params: {
                    referrer: 'locations.list',
                    referrerParams: null,
                    clearMessage:true
                },
                data: {
                    subTitle: 'Create a new location'
                }
            })
            .state('location.admin', {
                url: '/:locationId/admin',
                templateUrl: 'ui-sentinel-locations/location-admin.html',
                params: {
                    referrer: 'locations.list',
                    referrerParams: null,
                    clearMessage:true
                }
            })
            .state('location.details', {
                url: '/:locationId/details',
                templateUrl: 'ui-sentinel-locations/location-details.html',
                params: {
                    referrer: 'locations.list',
                    referrerParams: null,
                    clearMessage:true
                },
                data:{
                    pageTitle: 'Manage Locations-Details',
                }
            });
    }
})();