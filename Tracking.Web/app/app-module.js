/*!
 * Vision Tracking v1.0.0
 * http://www.onasset.com
 *
 * Includes ...
  *
 * Copyright 2016 OnAsset Intelligence, Inc. and other contributors
 *
 * Date: 2016-09-01
 */

(function() {
    'use strict';

    angular.module('tracking', [
        'ui.router',
        'ngResource',
        'ngSanitize',
        'LocalStorageModule',
        'tracking.api.host',
        'tracking.api.tracking',
        'tracking.ui.common',
        'tracking.ui.feedback',
        'tracking.ui.shipments',
        'tracking.ui.shipment',
        'tracking.ui.theme'
    ]);
})();

