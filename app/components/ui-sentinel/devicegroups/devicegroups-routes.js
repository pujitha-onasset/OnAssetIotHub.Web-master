(function() {
    'use strict';

    angular
        .module('ui-sentinel.devicegroups')
        .config(routes);

    routes.$inject = ['$stateProvider', 'SENTINEL_API_HOST_CONSTANTS'];
    function routes($stateProvider, USER_ROLES) {
        $stateProvider
            .state('devicegroups', {
                abstract: true,
                url: '/devicegroups',
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
                    pageTitle: 'Manage Device Groups',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('devicegroups.list', {
                url: '/list',
                templateUrl: 'ui-sentinel-devicegroups/devicegroups-list.html'
            })
            .state('devicegroup', {
                abstract: true,
                url: '/devicegroups',
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
                    pageTitle: 'Manage Device Groups',
                    subTitle: null,
                    parentState: 'devicegroups.list'
                }
            })
            .state('devicegroup.admin', {
                url: '/:groupId/admin',
                templateUrl: 'ui-sentinel-devicegroups/devicegroup-admin.html',
                params: {
                    referrer: 'devicegroups.list',
                    referrerParams: null
                }
            })
            .state('devicegroup.new', {
                url: '/new',
                templateUrl: 'ui-sentinel-devicegroups/devicegroup-admin.html',
                params: {
                    referrer: 'devicegroups.list',
                    referrerParams: null
                },
                data: {
                    subTitle: 'Create a new device group'
                }
            });
    }
})();