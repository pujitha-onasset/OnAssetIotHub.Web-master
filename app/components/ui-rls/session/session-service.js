(function() {
    'use strict';

    angular
        .module('ui-rls.session')
        .factory('RlsUiSession', RlsUiSession);

    RlsUiSession.$inject = ['ApiToken', 'LoginsApiService', 'AccountApiService', 'localStorageService', 'USER_ROLES'];
    function RlsUiSession(ApiToken, LoginsApiService, AccountApiService, localStorageService, USER_ROLES) {
        var service = {
            user: null,
            focus: null,
            mode: 'account',
            toggleAdminMode: toggleAdminMode,
            create: create,
            setFocus: setFocus,
            set: set,
            clear: clear,
            isValid: isValid,
            isExpired: isExpired,
            store: store,
            load: load,
            isReloaded: false,
            showShipmentModule: showShipmentModule,
            showWarehouseModule: showWarehouseModule,
            showCalibrationModule: showCalibrationModule
        };

        return service;

        ///////////////////////////
        
        function create(tokenResponse, onSuccessFn, onErrorFn, isVision) {
            isVision = typeof isVision !== "undefined" ? isVision : false;
            clear();

            ApiToken.setRlsToken(tokenResponse.access_token, tokenResponse.token_type, ApiToken.getRlsExpirationDate(tokenResponse.expires_in));
            if (!ApiToken.isRlsTokenValid()) {
                return;
            }
            
            var currentLoginPromise = LoginsApiService.getCurrent().$promise;
            currentLoginPromise.then(
                function(login) {
                    var currentAccountPromise = AccountApiService.getAccount().$promise;
                    currentAccountPromise.then(
                        function(account) {
                            var isExpired=false;
                            if(login.dateLockoutExpiresTimestamp && !login.role.startsWith("api")){
                                var timeDiff = (login.dateLockoutExpiresTimestamp * 1000) - new Date().getTime();
                                if(timeDiff<0)
                                    isExpired=true;
                            }
                            
                            service.user = {
                                id: login.id,
                                name: login.userName,
                                role: login.role,
                                isExpired: isExpired,
                                isAnAdmin: login.role === 'api-admin' || login.role === 'api-login' || login.role === USER_ROLES.systemAdmin || login.role === USER_ROLES.accountAdmin || login.role === USER_ROLES.supportAdmin,
                                isSystemAdmin: login.role === 'api-admin' || login.role === USER_ROLES.systemAdmin,
                                isSupportAdmin: login.role === USER_ROLES.supportAdmin,
                                isSupportObserver: login.role === USER_ROLES.supportObserver,
                                isAccountAdmin: login.role === 'api-login' || login.role === USER_ROLES.accountAdmin,
                                isAccountEditor: login.role === USER_ROLES.accountEditor,
                                isAccountObserver: login.role === USER_ROLES.accountObserver,
                                accountId: account.id,
                                accountName: account.name,
                                accountAccessLevel: account.accessLevel
                            };

                            if (isVision) {
                                service.focus = {
                                    'id': localStorageService.get('visionClient').clientGuid,
                                    'name': localStorageService.get('visionClient').clientName,
                                    'accessLevel': account.accessLevel,
                                };
                            } else{
                                service.focus = {
                                    id: account.id,
                                    name: account.name,
                                    accessLevel: account.accessLevel
                                };
                            }

                            store();
                            if (onSuccessFn) {
                                onSuccessFn();
                            }
                        },
                        function(error) {
                            console.log(error);
                            if (onErrorFn) {
                                onErrorFn();
                            }
                        }
                    );
                },
                function (error) {
                    console.log(error);
                    if (onErrorFn) {
                        onErrorFn();
                    }
                });
        }

        function set(user, focus) {
            service.user = user;
            if (user) {
                //service.user.isAnAdmin = user && user.role === 'api-admin';
                service.user = angular.extend(user, {
                    isAnAdmin: user.role === 'api-admin' || user.role === 'api-login',
                    isSystemAdmin: user.role === USER_ROLES.systemAdmin,
                    isSupportAdmin: user.role === USER_ROLES.supportAdmin,
                    isSupportObserver: user.role === USER_ROLES.supportObserver,
                    isAccountAdmin: user.role === USER_ROLES.accountAdmin,
                    isAccountEditor: user.role === USER_ROLES.accountEditor,
                    isAccountObserver: user.role === USER_ROLES.accountObserver,
                });
            }
            service.focus = focus;
            localStorageService.set('rlsUser', service.user);
            localStorageService.set('rlsFocus', service.focus);
        }

        function setFocus(account) {
            service.focus = {
                id: !account ? service.user.accountId : account.id,
                name: !account ? service.user.accountName : account.name,
                accessLevel: !account ? service.user.accountAccessLevel: account.accessLevel
            };
            localStorageService.set('rlsFocus', service.focus);
        }
        
        function store() {
            var authToken = ApiToken.getRlsToken();
            localStorageService.set('rlsToken', authToken.token);
            localStorageService.set('rlsTokenType', authToken.type);
            localStorageService.set('rlsTokenExpirationTime', authToken.expiresAt);
            localStorageService.set('rlsUser', service.user);
            localStorageService.set('rlsFocus', service.focus);
        }

        function load() {
            ApiToken.setRlsToken(
                localStorageService.get('rlsToken'),
                localStorageService.get('rlsTokenType'),
                new Date(localStorageService.get('rlsTokenExpirationTime')));

            service.user = localStorageService.get('rlsUser');
            service.focus = localStorageService.get('rlsFocus');
            service.isReloaded = true;
        }

        function clear() {
            ApiToken.clearRls();
            service.user = null;
            service.focus = null;
            service.isReloaded = false;
            localStorageService.clearAll(/^rls.*$/);
        }
        
        function isValid() {
            if (!service.user || !service.focus) {
                load();
            }

            return ApiToken.isRlsTokenValid() && service.user && service.focus;
        }

        function isExpired() {
            if (!service.user || !service.focus) {
                load();
            }
            return ApiToken.isRlsTokenValid() && service.user && service.user.isExpired;
        }

        function toggleAdminMode() {
            service.mode = service.mode === 'admin' ? 'account' : 'admin';
        }

        function showShipmentModule(){
            console.log("showShipmentModule");
            if(service.user){
                if(service.user.isSystemAdmin && (service.focus.id === service.user.accountId)){
                    return true;
                } else {
                    return _.find(service.focus.accessLevel,function(role){return role === "Shipment";});
                }
            }

            return false;
        }

        function showWarehouseModule(){
            if(service.user){
                if(service.user.isSystemAdmin && (service.focus.id === service.user.accountId))
                    return true;
                else {
                    return _.find(service.focus.accessLevel,function(role){return role === "Warehouse";});
                }
            }

            return false;
        }

        function showCalibrationModule(){
            if(service.user){
                if(service.user.isSystemAdmin && (service.focus.id === service.user.accountId))
                    return true;
                else {
                    return _.find(service.focus.accessLevel,function(role){return role === "Calibration";});
                }
            }

            return false;
        }
    }

})();

