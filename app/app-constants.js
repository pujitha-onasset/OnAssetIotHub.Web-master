(function() {
    'use strict';

    angular
        .module('sentinel.gateway.web')
        .constant('API_HOST', 'http://localhost:15931/') //TODO: since it can change, it should be moved to a service
        .constant('API_URLS', {
            token: 'token',
            clients: 'rest/1/clients'
        })
        .constant('AUTH_EVENTS', {
            loginSuccess: 'auth-login-success',
            loginFailed: 'auth-login-failed',
            logoutSuccess: 'auth-logout-success',
            sessionTimeout: 'auth-session-timeout',
            notAuthenticated: 'auth-not-authenticated',
            notAuthorized: 'auth-not-authorized'
        })
        .constant('GoogleStaticMapApiKey', 'GOOGLE-MAPS-API-KEY');
})();


