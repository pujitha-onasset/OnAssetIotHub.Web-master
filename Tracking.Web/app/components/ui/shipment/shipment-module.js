(function() {
    'use strict';

    angular.module('tracking.ui.shipment', [
        'tracking.api.tracking',
        'tracking.ui.common',
        'tracking.ui.shipment.filterbar',
        'tracking.ui.shipment.map',
        'tracking.ui.shipment.reports'
    ]);

})();
