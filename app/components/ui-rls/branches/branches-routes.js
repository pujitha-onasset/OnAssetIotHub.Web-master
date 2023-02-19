(function() {
    'use strict';

    angular
        .module('ui-rls.branches')
        .config(routes);

    routes.$inject = ['$stateProvider', 'SENTINEL_API_HOST_CONSTANTS'];
    function routes($stateProvider, USER_ROLES) {
        $stateProvider
            .state('branches', {
                abstract: true,
                url: '/branches',
                template: '<ui-view/>',
                data: {
                    isRlsRoute: true,
                    rlsAuthorizationRequired: true,
                    pageTitle: 'Manage Branches',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('branches.list', {
                url: '/list',
                templateUrl: 'ui-rls-branches/branches-list.html'
            })
            .state('branches.tracking', {
                url: '/tracking',
                templateUrl: 'ui-rls-branches/branches-tracking.html',
                data: {
                    pageTitle: 'Branches Tracking'
                }
            })
            .state('branch', {
                abstract: true,
                url: '/branches',
                template: '<ui-view/>',
                data: {
                    isRlsRoute: true,
                    rlsAuthorizationRequired: true,
                    pageTitle: 'Manage Branches',
                    subTitle: null,
                    parentState: 'branches.list'
                }
            })
            .state('branch.new', {
                url: '/new',
                templateUrl: 'ui-rls-branches/branch-admin.html',
                params: {
                    referrer: 'branches.list',
                    referrerParams: null,
                    clearMessage:true
                },
                data: {
                    subTitle: 'Create a new branch'
                }
            })
            .state('branch.admin', {
                url: '/:branchId/admin',
                templateUrl: 'ui-rls-branches/branch-admin.html',
                params: {
                    referrer: 'branches.list',
                    referrerParams: null,
                    clearMessage:true
                }
            })
            .state('branch.details', {
                url: '/:branchId/details',
                templateUrl: 'ui-rls-branches/branch-details.html',
                params: {
                    referrer: 'branches.list',
                    referrerParams: null,
                    clearMessage:true
                },
                data:{
                    pageTitle: 'Manage Branches-Details',
                }
            })
            .state('branchcontact', {
                abstract: true,
                url: '/branchcontacts',
                template: '<ui-view/>',
                data: {
                    isRlsRoute: true,
                    rlsAuthorizationRequired: true,
                    pageTitle: 'Manage Branch Contacts',
                    subTitle: null,
                    parentState: 'branchcontacts.list'
                }
            })
            .state('branchcontact.new', {
                url: '/new/:branchId',
                templateUrl: 'ui-rls-branches/branchcontacts-admin.html',
                params: {
                    referrer: 'branchcontacts.list',
                    referrerParams: null
                },
                data: {
                    subTitle: 'Create a new branch contact'
                }
            })
            .state('branchcontact.admin', {
                url: '/:branchId/admin/:contactId',
                templateUrl: 'ui-rls-branches/branchcontacts-admin.html',
                params: {
                    referrer: 'branchcontacts.list',
                    referrerParams: null
                }
            });
    }
})();