(function() {
    'use strict';

    angular
        .module('ui-sentinel.shipments.notificationsAdmin')
        .controller('NotificationSubscriberAdminController', NotificationSubscriberAdminController);

    NotificationSubscriberAdminController.$inject = ['$rootScope', '$state', '$stateParams', 'SentinelUiSession', 'FeedbackService', 'ShipmentNotificationsService', 'AccountApiService', 'LoginsApiService'];
    function NotificationSubscriberAdminController($rootScope, $state, $stateParams, SentinelUiSession, FeedbackService, ShipmentNotificationsService, AccountApiService, LoginsApiService) {

        var vm = {
            subscriber: null,
            feedback: FeedbackService,
            webObserverToRevoke: null,
            checkForDuplicateLogin: null,
            clearErrorMessageFlag: null,
            firstName: {
                value: null,
                isPristine: true,
                hasError: function() {
                    return this.errors.isBlank;
                },
                errors: {
                    isBlank: true
                },
                validate: function () {
                    this.isPristine = false;
                    this.errors.isBlank = !this.value;
                }
            },
            lastName: {
                value: null,
                isPristine: true,
                hasError: function() {
                    return this.errors.isBlank;
                },
                errors: {
                    isBlank: true
                },
                validate: function () {
                    this.isPristine = false;
                    this.errors.isBlank = !this.value;
                }
            },
            email: {
                value: null,
                isPristine: true,
                hasError: function() {
                    return this.errors.isBlank || this.errors.isBadFormat || this.errors.isDuplicate;
                },
                errors: {
                    isBlank: true,
                    isBadFormat: false,
                    isDuplicate: false
                },
                validate: validateEmail
            },
            password: {
                value: null,
                isPristine: true,
            },
            accountName: {
                value:null
            },
            role: {
                value: 'WebAccountObserver'
            },
            isShipmentCompletedOn: true,
            isShipmentCreatedOn: true,
            isShipmentOverdueOn: true,
            isStopArrivalOn: true,
            isStopDepartureOn: true,
            isViewAlarmOn: true,        
            mode: {
                isCreateMode: true,
                isEditMode: false,
                isDeleteMode: false
            },
            hasPermission: {
                toChange: false
            },
            hasPermissionForPassword: {
                toChange: true
            },
            actions: {
                submit: saveSubscriber,
                reset: reset,
                passwordGenerate: passwordGenerate,
                beginRemove: beginRemove,
                remove: removeSubscriber,
                cancelRemove: cancelRemove,
                close: close
            }
        };
        activate();
        return vm;

        function activate() {
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($state.current.name == 'shipment-notification-subscriber.admin' || $state.current.name == 'shipment-notification-subscriber.new') {
                    $state.go('shipmentnotifications.admin');
                }
            });

            setPermissions();

            if ($state.current.name == 'shipment-notification-subscriber.admin') {
                if ($stateParams.subscriber) {
                    //handles the asynchronous issue when creating a subscriber
                    vm.subscriber = $stateParams.subscriber;
                    reset();
                }
                else {
                    load();
                }
            }
            else {
                reset();
            }

            // To get the account id, for creating the user as an Account Observer.
            var promise = AccountApiService.getAccount().$promise;
            promise.then(
                function(result) {
                    vm.accountName.value = result;
                });
        }

        function passwordGenerate(type) {
            var uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var symbols = "!#$%&*@";

            var strUpperPart = uppers.charAt(Math.floor(Math.random() * uppers.length));
            var strSymbolsPart = symbols.charAt(Math.floor(Math.random() * symbols.length));

            var strPassword = strUpperPart + Math.random().toString(36).slice(-8) + strSymbolsPart;
           
            vm.password.value = strPassword;
           
            if (type == 'add') {
                vm.password.value = strPassword;
            } else {
                vm.password.value = strPassword;
            }
        }

        function beginRemove() {
            vm.feedback.clear();
            vm.mode.isDeleteMode = true;
        }

        function cancelRemove() {
            vm.feedback.clear();    
            vm.mode.isDeleteMode = false;
        }
        
        function close() {
            vm.feedback.clear();
            vm.subscriber = null;
            reset();
            $state.go($stateParams.referrer, $stateParams.referrerParams);  
        }

        function load() {
            $rootScope.loading = true;
            var promise = ShipmentNotificationsService.getContact(SentinelUiSession.focus, $stateParams.subscriberId).$promise;
            promise.then(
                function(result) {
                    vm.subscriber = result;
                    reset();
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function setPermissions() {
            vm.hasPermission.toChange =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;
        }

        // function saveSubscriber() {
        
        //     vm.feedback.clear();
            
        //     vm.firstName.validate();
        //     vm.lastName.validate();
        //     vm.email.validate();
        
        //     if (vm.firstName.hasError() || vm.lastName.hasError() || vm.email.hasError() ) {
        //         return;
        //     }
            
        //     var subscriber = {
        //         clientGuid: vm.subscriber ? vm.subscriber.clientGuid : SentinelUiSession.focus.clientGuid,
        //         firstName: vm.firstName.value,
        //         lastName: vm.lastName.value,
        //         password: vm.password.value,
        //         emailAddress: vm.email.value,
        //         notifications: []
        //     };
        //     if (vm.subscriber) {
        //         subscriber.id = vm.subscriber.id;
        //     }

        //     if (vm.isShipmentCompletedOn)
        //         subscriber.notifications.push('ShipmentCompleted');
        //     if (vm.isShipmentCreatedOn)
        //         subscriber.notifications.push('ShipmentCreated');
        //     if (vm.isShipmentOverdueOn)
        //         subscriber.notifications.push('ShipmentOverdue');
        //     if (vm.isStopArrivalOn)
        //         subscriber.notifications.push('StopArrival');
        //     if (vm.isStopDepartureOn)
        //         subscriber.notifications.push('StopDeparture');

        //         // console.log('subs', subscriber)
        //     var promise = vm.mode.isEditMode ?
        //         ShipmentNotificationsService.updateContact(SentinelUiSession.focus, subscriber).$promise :
        //         ShipmentNotificationsService.addContact(SentinelUiSession.focus, subscriber).$promise;
            
        //         $rootScope.loading = true;
        //     promise.then(
        //         function(result) {
        //             $rootScope.loading = false;
        //             vm.feedback.addSuccess(vm.lastName.value + ', ' + vm.firstName.value + ' has been ' + (vm.mode.isCreateMode ? 'created' : 'updated'));
        //             if (vm.mode.isCreateMode) {

        //                 subscriber.id = result.id;
        //                 $state.go('shipment-notification-subscriber.admin', {subscriberId: result.id, subscriber: subscriber, notifications: subscriber.notifications });
        //                 return;
        //             }
        //             vm.subscriber = result;
        //             reset();
        //         },
        //         function (error) {
        //             $rootScope.loading = false;
        //             vm.feedback.addError(error.data.message);
        //         }
        //     );
        // }

        function reset() {
            vm.mode.isDeleteMode = false;

            if (!vm.subscriber) {

                vm.mode.isCreateMode = true;
                vm.mode.isEditMode = false;

                vm.firstName.value = null;
                vm.lastName.value = null;
                vm.email.value = null;

                vm.isShipmentCompletedOn = true;
                vm.isShipmentCreatedOn = true;
                vm.isShipmentOverdueOn = true;
                vm.isStopArrivalOn = true;
                vm.isStopDepartureOn = true;
                vm.isViewAlarmOn = true;
            }
            else {
                $state.current.data.subTitle = vm.subscriber.lastName + ', ' + vm.subscriber.firstName;

                vm.mode.isCreateMode = false;
                vm.mode.isEditMode = true;
                vm.firstName.value = vm.subscriber.firstName;
                vm.lastName.value = vm.subscriber.lastName;
                vm.email.value = vm.subscriber.emailAddress;

                vm.isShipmentCompletedOn = _.indexOf(vm.subscriber.notifications, 'ShipmentCompleted') > -1;
                vm.isShipmentCreatedOn = _.indexOf(vm.subscriber.notifications, 'ShipmentCreated') > -1;
                vm.isShipmentOverdueOn = _.indexOf(vm.subscriber.notifications, 'ShipmentOverdue') > -1;
                vm.isStopArrivalOn = _.indexOf(vm.subscriber.notifications, 'StopArrival') > -1;
                vm.isStopDepartureOn = _.indexOf(vm.subscriber.notifications, 'StopDeparture') > -1;
                vm.isViewAlarmOn =  _.indexOf(vm.subscriber.notifications, 'ViewAlarm') > -1;

                //for the special case after an add, override with the passed in notifications array
                if ($stateParams.notifications) {
                    vm.isShipmentCompletedOn = _.indexOf($stateParams.notifications, 'ShipmentCompleted') > -1;
                    vm.isShipmentCreatedOn = _.indexOf($stateParams.notifications, 'ShipmentCreated') > -1;
                    vm.isShipmentOverdueOn = _.indexOf($stateParams.notifications, 'ShipmentOverdue') > -1;
                    vm.isStopArrivalOn = _.indexOf($stateParams.notifications, 'StopArrival') > -1;
                    vm.isStopDepartureOn = _.indexOf($stateParams.notifications, 'StopDeparture') > -1;
                    vm.isViewAlarmOn =  _.indexOf($stateParams.notifications, 'ViewAlarm') > -1;
                }
            }

            vm.firstName.isPristine = true;
            vm.lastName.isPristine = true;
            vm.email.isPristine = true;

            vm.firstName.errors.isBlank = true;
            vm.lastName.errors.isBlank = true;
            vm.email.errors.isBlank = true;
            vm.email.errors.isBadFormat = false;
        }

        function removeSubscriber() {
            vm.feedback.clear();
            $rootScope.loading = true;
            var promise = ShipmentNotificationsService.removeContact(SentinelUiSession.focus, vm.subscriber).$promise;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    close();
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );

            // Suspend the webObserver account.
            var promise = LoginsApiService.listLogins().$promise;
            promise.then(
                function (result) {
                    
                    vm.webObserverToRevoke = result.filter( x => x.userName == vm.subscriber.emailAddress);
                    

                    var promise = LoginsApiService.revokeAccess(vm.webObserverToRevoke[0]).$promise;
                    promise.then(
                        function (result) {
                            console.log('Account revoked.')
                        },
                        function (error) {
                            console.log(error);
                        }
                    )
                },
                function (error) {
                    console.log(error)

                }
            )
        }

        function validateEmail() {
            vm.email.isPristine = false;
            vm.email.errors.isBadFormat = false;

            vm.email.errors.isBlank = !vm.email.value;
            if (vm.email.errors.isBlank) {
                return;
            }

            var formatValidator = /^([\w+-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/i;
            vm.email.errors.isBadFormat = !formatValidator.test(vm.email.value.trim());
        }

        function saveSubscriber(){
            vm.feedback.clear();
            
            vm.firstName.validate();
            vm.lastName.validate();
            vm.email.validate(); 
            if (vm.firstName.hasError() || vm.lastName.hasError() || vm.email.hasError() ) {
                return;
            }

            var subscriber = {
                clientGuid: vm.subscriber ? vm.subscriber.clientGuid : SentinelUiSession.focus.clientGuid,
                // clientGuid: vm.subscriber ? vm.subscriber.clientGuid : vm.accountName.value.id,
                firstName: vm.firstName.value,
                lastName: vm.lastName.value,
                password: vm.password.value,
                emailAddress: vm.email.value,
                notifications: []
            };
            if (vm.subscriber) {
                subscriber.id = vm.subscriber.id;
            }

            if (vm.isShipmentCompletedOn)
                subscriber.notifications.push('ShipmentCompleted');
            if (vm.isShipmentCreatedOn)
                subscriber.notifications.push('ShipmentCreated');
            if (vm.isShipmentOverdueOn)
                subscriber.notifications.push('ShipmentOverdue');
            if (vm.isStopArrivalOn)
                subscriber.notifications.push('StopArrival');
            if (vm.isStopDepartureOn)
                subscriber.notifications.push('StopDeparture');
            if (vm.isViewAlarmOn)
                subscriber.notifications.push('ViewAlarm');

            // checking if the login already exists
            var promise = LoginsApiService.listLogins().$promise;
            promise.then(
                function (result) {
                    vm.checkForDuplicateLogin = result.filter( x => x.userName == vm.email.value);
                    
                }
            )

            // for adding a subscriber - old way
            var promise = vm.mode.isEditMode ?
                ShipmentNotificationsService.updateContact(SentinelUiSession.focus, subscriber).$promise :
                ShipmentNotificationsService.addContact(SentinelUiSession.focus, subscriber).$promise;
            
                $rootScope.loading = true;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.feedback.addSuccess('Subscriber ' + vm.firstName.value + (vm.mode.isCreateMode ? ' created' : ' updated') + ' successfully!');
                    if (vm.mode.isCreateMode) {

                        // for creating a WebObserver account.
                        if(vm.password.value && !vm.checkForDuplicateLogin.length){
                            var promise = LoginsApiService.addLogin(SentinelUiSession.focus, vm.email.value, vm.password.value, vm.role.value).$promise;
                            promise.then(
                                function (result) {
                                    vm.feedback.addSuccess(vm.email.value + ' account has been ' + (vm.mode.isCreateMode ? 'created' : 'updated'));
                                },
                                function (error) {
                                    console.log(error);
                                    vm.feedback.addError(error.data.message);
                                }
                            ).finally(function(){
                                $rootScope.loading = false;
                            });
                        } else {
                            if(vm.checkForDuplicateLogin.length !== 0 && vm.checkForDuplicateLogin[0]?.isLocked){
                                vm.feedback.addSuccess(`Subscriber added successfully.
                                The Login account already exists, consider unlocking the user from manage logins screen.`);
                            } else{
                                vm.feedback.addSuccess(`Subscriber added successfully.
                                Note: A new user has not been created.`);
                            }
                            
                        }
                        vm.clearErrorMessageFlag = true;
                        

                        subscriber.id = result.id;
                        $state.go('shipment-notification-subscriber.admin', {subscriberId: result.id, subscriber: subscriber, notifications: subscriber.notifications });
                        return;
                    }
                    vm.subscriber = result;
                    reset();
                },
                
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }
    }
})();

