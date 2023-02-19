(function() {
    'use strict';

    angular
        .module('ui-rls.login')
        .constant('LOGIN_EVENTS', {
            LOGIN_SUCCESS: 'LOGIN_SUCCESS',
            LOGIN_FAILURE: 'LOGIN_FAILURE'
        });

})();
