(function () {
    'use strict';

    angular
        .module('api-sentinel')
        .constant('SENTINEL_API_HOST_CONSTANTS', {
            'URL': INSERT_SENTINEL_API_HOST_URL,
            'VISION_URL': INSERT_VISION_API_HOST_URL,
            'ERRORS': {
                'AUTHENTICATION_REQUIRED': 'AUTHENTICATION_REQUIRED'
            },
            'USER_ROLES': {
                none: 'api-none',
                all: 'api-all',
                apiAdmin: 'api-admin',
                apiAccount: 'api-account'
            }
        });

})();