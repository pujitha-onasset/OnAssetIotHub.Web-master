(function() {
    'use strict';

    angular
        .module('ui-sentinel.shipments')
        .config(routes);

    routes.$inject = ['$stateProvider', 'SENTINEL_API_HOST_CONSTANTS'];
    function routes($stateProvider, USER_ROLES) {
        $stateProvider
            .state('shipments', {
                abstract: true,
                url: '/shipments',
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
                    pageTitle: 'Manage Shipments',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('shipments.list', {
                url: '/list',
                templateUrl: 'ui-sentinel-shipments.shipmentsList/shipments-list.html'
            })
            .state('shipments.map', {
                url: '/map',
                templateUrl: 'ui-sentinel-shipments.latestShipmentTracking/latest-shipment-tracking-map.html',
                data: {
                    pageTitle: 'Track Shipments',
                    subTitle: null
                }
            })
            .state('shipments.reports', {
                url: '/reports',
                templateUrl: 'ui-sentinel-shipments.latestShipmentTracking/latest-shipment-tracking-list.html',
                data: {
                    pageTitle: 'Track Shipments',
                    subTitle: null
                }
            })
            .state('shipment-new', {
                url: '/shipments/new',
                templateUrl: 'ui-sentinel-shipments.shipmentNew/shipment-new.html',
                data: {
                    authorizationRequired: true,
                    authorizedRoles: [
                        USER_ROLES.systemAdmin,
                        USER_ROLES.supportAdmin,
                        USER_ROLES.supportObserver,
                        USER_ROLES.accountAdmin,
                        USER_ROLES.accountEditor
                    ],
                    pageTitle: 'Manage Shipments',
                    subTitle: 'Create a new shipment',
                    parentState: 'shipments.list'
                }
            })
            .state('shipment', {
                abstract: true,
                url: '/shipments',
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
                    pageTitle: 'Manage Shipments',
                    subTitle: null,
                    parentState: 'shipments.list'
                },
                params: {
                    referrer: 'shipments.list',
                    referrerParams: null
                }
            })
            .state('shipment.admin', {
                url: '/:shipmentId/admin',
                templateUrl: 'ui-sentinel-shipments.shipmentAdmin/shipment-admin.html'
            })
            .state('shipment.reports', {
                url: '/:shipmentId/reports',
                templateUrl: 'ui-sentinel-shipments.shipmentTracking/shipment-tracking-list.html',
                data: {
                    pageTitle: 'Track Shipments',
                    parentState: 'shipments.map'
                }
            })
            .state('shipment.map', {
                url: '/:shipmentId/map',
                templateUrl: 'ui-sentinel-shipments.shipmentTracking/shipment-tracking-map.html',
                data: {
                    pageTitle: 'Track Shipments',
                    parentState: 'shipments.map'
                }
            })
            .state('shipment.summary', {
                url: '/:shipmentId/summary',
                templateUrl: 'ui-sentinel-shipments.shipmentTracking/shipment-tracking-summary.html',
                data: {
                    pageTitle: 'Track Shipments',
                    parentState: 'shipments.map'
                }
            })            
            .state('shipmentnotifications', {
                abstract: true,
                url: '/shipmentnotifications',
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
                    pageTitle: 'Manage Shipping Notifications',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('shipmentnotifications.admin', {
                url: '/admin',
                templateUrl: 'ui-sentinel-shipments.notificationsAdmin/notifications-admin.html'
            })
            .state('shipment-notification-subscriber', {
                abstract: true,
                url: '/shipmentnotificationsubscribers',
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
                    pageTitle: 'Manage Shipping Notification Subscribers',
                    subTitle: null,
                    parentState: 'shipmentnotifications.admin'
                }
            })
            .state('shipment-notification-subscriber.new', {
                url: '/new',
                templateUrl: 'ui-sentinel-shipments.notificationsAdmin/notification-subscriber-admin.html',
                params: {
                    referrer: 'shipmentnotifications.admin',
                    referrerParams: null,
                    notifications: null
                },
                data: {
                    subTitle: 'Create a new shipping notification subscriber'
                }
            })
            .state('shipment-notification-subscriber.admin', {
                url: '/:subscriberId/admin',
                templateUrl: 'ui-sentinel-shipments.notificationsAdmin/notification-subscriber-admin.html',
                params: {
                    referrer: 'shipmentnotifications.admin',
                    referrerParams: null,
                    subscriber: null,
                    notifications: null
                }
            })
            .state('shipmenttemplates', {
                abstract: true,
                url: '/shipmenttemplates',
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
                    pageTitle: 'Manage Shipping Templates',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('shipmenttemplates.list', {
                url: '/list',
                templateUrl: 'ui-sentinel-shipments.templatesAdmin/templates-list.html'
            })
            .state('shipmenttemplate', {
                abstract: true,
                url: '/shippingtemplates',
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
                    pageTitle: 'Manage Shipping Templates',
                    subTitle: null,
                    parentState: 'shipmenttemplates.list'
                }
            })
            .state('shipmenttemplate.new', {
                url: '/new',
                templateUrl: 'ui-sentinel-shipments.templatesAdmin/template-admin.html',
                data: {
                    subTitle: 'Create a new shipping template'
                }
            })
            .state('shipmenttemplate.admin', {
                url: '/:templateId/admin',
                templateUrl: 'ui-sentinel-shipments.templatesAdmin/template-admin.html'
            })
        ;
    }
})();