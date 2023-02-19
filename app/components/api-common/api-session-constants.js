(function() {
    'use strict';

    angular
        .module('api-common')
        .constant('USER_ROLES', {
            none: 'WebNoRole',
            all: 'WebAll',
            systemAdmin: 'WebSystemAdmin',
            supportAdmin: 'WebSupportAdmin',
            supportObserver: 'WebSupportObserver',
            accountAdmin: 'WebAccountAdmin',
            accountEditor: 'WebAccountEditor',
            accountObserver: 'WebAccountObserver'
        });
})();