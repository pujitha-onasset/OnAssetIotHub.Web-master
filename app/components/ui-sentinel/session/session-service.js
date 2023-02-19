(function() {
    'use strict';

    angular
        .module('ui-sentinel.session')
        .factory('SentinelUiSession', SentinelUiSession);

    SentinelUiSession.$inject = ['ApiToken', 'LoginsApiService', 'AccountApiService', 'localStorageService', 'USER_ROLES','TrackingConfigService'];
    function SentinelUiSession(ApiToken, LoginsApiService, AccountApiService, localStorageService, USER_ROLES,TrackingConfigService) {
        var service = {
            user: null,
            focus: null,
            mode: 'account',
            toggleAdminMode: toggleAdminMode,
            create: create,
            createNoclear: createNoclear,
            setFocus: setFocus,
            set: set,
            clear: clear,
            isValid: isValid,
            isExpired: isExpired,
            isEulaAgreement:isEulaAgreement,
            store: store,
            load: load,
            isReloaded: false,
            showShipmentModule: showShipmentModule,
            showWarehouseModule: showWarehouseModule,
            showCalibrationModule: showCalibrationModule,
            showPivotModule: showPivotModule
        };

        return service;

        ///////////////////////////
        
        function create(tokenResponse, onSuccessFn, onErrorFn) {
            clear();

            ApiToken.set(tokenResponse.access_token, tokenResponse.token_type, ApiToken.getExpirationDate(tokenResponse.expires_in));
            if (!ApiToken.isValid()) {
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
                                accountAccessLevel: account.accessLevel,
                                isEulaAgreement: login.eulaAgreement
                            };

                            service.focus = {
                                id: account.id,
                                name: account.name,
                                accessLevel: account.accessLevel
                            };
                            loadTrackingConfig();


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

        function createNoclear(tokenResponse) {
           

            ApiToken.set(tokenResponse.access_token, tokenResponse.token_type, ApiToken.getExpirationDate(tokenResponse.expires_in));
            if (!ApiToken.isValid()) {
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

                            service.focus = {
                                id: account.id,
                                name: account.name,
                                accessLevel: account.accessLevel
                            };
                            loadTrackingConfig();
                            store();
                            
                        },
                        function(error) {
                            console.log(error);
                            
                        }
                    );
                },
                function (error) {
                    console.log(error);
                   
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
            loadTrackingConfig();
            localStorageService.set('user', service.user);
            localStorageService.set('focus', service.focus);
        }

        function setFocus(account) {
            service.focus = {
                id: !account ? service.user.accountId : account.id,
                name: !account ? service.user.accountName : account.name,
                accessLevel: !account ? service.user.accountAccessLevel: account.accessLevel
            };
            loadTrackingConfig();
            localStorageService.set('focus', service.focus);
        }
        
        function store() {
            var authToken = ApiToken.get();
            localStorageService.set('token', authToken.token);
            localStorageService.set('tokenType', authToken.type);
            localStorageService.set('tokenExpirationTime', authToken.expiresAt);
            localStorageService.set('user', service.user);
            localStorageService.set('focus', service.focus);
        }

        function load() {
            ApiToken.set(
                localStorageService.get('token'),
                localStorageService.get('tokenType'),
                new Date(localStorageService.get('tokenExpirationTime')));

            service.user = localStorageService.get('user');
            service.focus = localStorageService.get('focus');
            service.isReloaded = true;
        }

        function clear() {
            ApiToken.clear();
            service.user = null;
            service.focus = null;
            service.isReloaded = false;
            localStorageService.clearAll();
            /*localStorageService.set('token', null);
            localStorageService.set('tokenType', null);
            localStorageService.set('tokenExpirationTime', null);
            localStorageService.set('user', null);
            localStorageService.set('focus', null);*/
        }
        
        function isValid() {
            if (!service.user || !service.focus) {
                load();
            }

            return ApiToken.isValid() && service.user && service.focus;
        }

        function isExpired() {
            if (!service.user || !service.focus) {
                load();
            }
            return ApiToken.isValid() && service.user && service.user.isExpired;
        }

         function isEulaAgreement() {
            if (!service.user || !service.focus) {
                load();
            }
            return ApiToken.isValid() && service.user && service.user.isEulaAgreement;
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

        function showPivotModule(){
            if(service.user){
                if(service.user.isSystemAdmin && (service.focus.id === service.user.accountId))
                    return true;
                else {
                    return _.find(service.focus.accessLevel,function(role){return role === "Pivot";});
                }
            }

            return false;
        }

        function loadTrackingConfig() {
           
           var promise = TrackingConfigService.getConfig(service.focus).$promise;
            promise.then(
                function (result) {
                    if(result){
                      service.focus.trackingConfig = {"referencePrefix":result.shipmentReferencePrefix};
                      store();
                    }else
                      service.focus.trackingConfig = null;
                },
                function (error) {
                    
                }
            );
            
        }
    }

})();

