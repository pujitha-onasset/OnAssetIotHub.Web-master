(function () {
    'use strict';

    angular.module('ui-sentinel.shipments', [
        'ui-sentinel.shipments.shipmentsList',
        'ui-sentinel.shipments.shipmentAdmin',
        'ui-sentinel.shipments.shipmentNew',
        'ui-sentinel.shipments.shipmentStopRow',
        'ui-sentinel.shipments.templatesAdmin',
        'ui-sentinel.shipments.shipmentReportToolItem',
        'ui-sentinel.shipments.shipmentTracking',
        'ui-sentinel.shipments.latestShipmentTracking',
        'ui-sentinel.shipments.notificationsAdmin'
    ]);
})();