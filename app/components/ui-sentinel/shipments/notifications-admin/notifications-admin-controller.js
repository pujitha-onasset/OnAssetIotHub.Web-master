(function() {
    'use strict';

    angular
        .module('ui-sentinel.shipments.notificationsAdmin')
        .controller('NotificationsAdminController', NotificationsAdminController);

    NotificationsAdminController.$inject = ['$rootScope', 'SentinelUiSession', 'FeedbackService', 'ShipmentNotificationsService'];
    function NotificationsAdminController($rootScope, SentinelUiSession, FeedbackService, ShipmentNotificationsService) {

        //NOTE: proper camelcase is avoided here to support dynamic allocation based upon notification objects
        var vm = {
            stoparrival: null,
            shipmentcompleted: null,
            shipmentcreated: null,
            stopdeparture: null,
            shipmentoverdue: null,
            viewalarm: null,
            subscribers: [],
            feedback: FeedbackService,
            hasPermission: {
                toChange: false
            },
            actions: {
                subscriber: {
                    toggleCompletedForSubscriber: toggleCompletedForSubscriber,
                    toggleCreatedForSubscriber: toggleCreatedForSubscriber,
                    toggleOverdueForSubscriber: toggleOverdueForSubscriber,
                    toggleArrivalForSubscriber: toggleArrivalForSubscriber,
                    toggleDepartureForSubscriber: toggleDepartureForSubscriber,
                    toggleViewAlarmForSubscriber: toggleViewAlarmForSubscriber,
                },
                notification: {
                    toggleArrivalNotificationSubscribers: toggleArrivalNotificationSubscribers,
                    toggleArrivalShipmentSubscribers: toggleArrivalShipmentSubscribers,
                    toggleCompletedNotificationSubscribers: toggleCompletedNotificationSubscribers,
                    toggleCompletedShipmentSubscribers: toggleCompletedShipmentSubscribers,
                    toggleCreatedNotificationSubscribers: toggleCreatedNotificationSubscribers,
                    toggleDepartureNotificationSubscribers: toggleDepartureNotificationSubscribers,
                    toggleDepartureShipmentSubscribers: toggleDepartureShipmentSubscribers,
                    toggleOverdueNotificationSubscribers: toggleOverdueNotificationSubscribers,
                    toggleViewAlarmNotificationSubscribers: toggleViewAlarmNotificationSubscribers,
                    toggleViewAlarmShipmentSubscribers: toggleViewAlarmShipmentSubscribers,
                }
            },
            propertyName: ['lastName', 'firstName'],
            reverse: false,
            sortBy: sortBy,
        };
        activate();
        return vm;

        function activate() {
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'shipmentnotifications.admin') {
                    load();
                }
            });

            setPermissions();
            load();
        }

        function load() {
            vm.stoparrival = null;
            vm.shipmentcompleted = null;
            vm.shipmentcreated = null;
            vm.stopdeparture = null;
            vm.shipmentoverdue = null;
            vm.viewalarm = null;
            vm.subscribers = [];

            $rootScope.loading = true;

            var promise = ShipmentNotificationsService.getNotifications(SentinelUiSession.focus).$promise;
            promise.then(
                function(result) {
                    _.forEach(result, function(notification) {
                        if(notification.notificationType)
                            vm[notification.notificationType.toLowerCase()] = notification;
                    });
                    loadSubscribers();
                },
                function (error) {
                    console.log('err', error);
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function loadSubscribers() {
            vm.subscribers = [];
            var contactsPromise = ShipmentNotificationsService.getContacts(SentinelUiSession.focus).$promise;
            contactsPromise.then(
                function(result) {
                    _.forEach(result, function(subscriber) {
                        console.log(subscriber,"iSaC");
                        subscriber = angular.extend(subscriber, {
                            isStopArrivalOn: subscriber.notifications.indexOf('StopArrival') > -1,
                            isStopDepartureOn: subscriber.notifications.indexOf('StopDeparture') > -1,
                            isShipmentCompletedOn: subscriber.notifications.indexOf('ShipmentCompleted') > -1,
                            isShipmentCreatedOn: subscriber.notifications.indexOf('ShipmentCreated') > -1,
                            isShipmentOverdueOn: subscriber.notifications.indexOf('ShipmentOverdue') > -1,
                            isViewAlarmOn: subscriber.notifications.indexOf('ViewAlarm') > -1
                        });

                        vm.subscribers.push(subscriber);
                    });
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

        function toggleArrivalNotificationSubscribers() {
            $('#btn-arrival-notification-subscribers').blur();
            vm.stoparrival.isActiveForNotificationSubscribers = !vm.stoparrival.isActiveForNotificationSubscribers;
            var promise = ShipmentNotificationsService.updateArrival(SentinelUiSession.focus, vm.stoparrival).$promise;
            promise.then(
                function(result) {
                    vm.stoparrival = result;
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function toggleArrivalShipmentSubscribers() {
            $('#btn-arrival-shipment-subscribers').blur();
            vm.stoparrival.isActiveForShipmentSubscribers = !vm.stoparrival.isActiveForShipmentSubscribers;
            var promise = ShipmentNotificationsService.updateArrival(SentinelUiSession.focus, vm.stoparrival).$promise;
            $rootScope.loading = true;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.stoparrival = result;
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function toggleCompletedNotificationSubscribers() {
            $('#btn-completed-notification-subscribers').blur();
            vm.shipmentcompleted.isActiveForNotificationSubscribers = !vm.shipmentcompleted.isActiveForNotificationSubscribers;
            var promise = ShipmentNotificationsService.updateCompleted(SentinelUiSession.focus, vm.shipmentcompleted).$promise;
            $rootScope.loading = true;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.shipmentcompleted = result;
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function toggleCompletedShipmentSubscribers() {
            $('#btn-completed-shipment-subscribers').blur();
            vm.shipmentcompleted.isActiveForShipmentSubscribers = !vm.shipmentcompleted.isActiveForShipmentSubscribers;
            var promise = ShipmentNotificationsService.updateCompleted(SentinelUiSession.focus, vm.shipmentcompleted).$promise;
            $rootScope.loading = true;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.shipmentcompleted = result;
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function toggleCreatedNotificationSubscribers() {
            $('#btn-created-notification-subscribers').blur();
            vm.shipmentcreated.isActiveForNotificationSubscribers = !vm.shipmentcreated.isActiveForNotificationSubscribers;
            var promise = ShipmentNotificationsService.updateCreated(SentinelUiSession.focus, vm.shipmentcreated).$promise;
            $rootScope.loading = true;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.shipmentcreated = result;
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function toggleDepartureNotificationSubscribers() {
            $('#btn-departure-notification-subscribers').blur();
            vm.stopdeparture.isActiveForNotificationSubscribers = !vm.stopdeparture.isActiveForNotificationSubscribers;
            var promise = ShipmentNotificationsService.updateDeparture(SentinelUiSession.focus, vm.stopdeparture).$promise;
            $rootScope.loading = false;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.stopdeparture = result;
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function toggleDepartureShipmentSubscribers() {
            $('#btn-departure-shipment-subscribers').blur();
            vm.stopdeparture.isActiveForShipmentSubscribers = !vm.stopdeparture.isActiveForShipmentSubscribers;
            var promise = ShipmentNotificationsService.updateDeparture(SentinelUiSession.focus, vm.stopdeparture).$promise;
            $rootScope.loading = true;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.stopdeparture = result;
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }        

        function toggleOverdueNotificationSubscribers() {
            $('#btn-overdue-notification-subscribers').blur();
            vm.shipmentoverdue.isActiveForNotificationSubscribers = !vm.shipmentoverdue.isActiveForNotificationSubscribers;
            var promise = ShipmentNotificationsService.updateOverdue(SentinelUiSession.focus, vm.shipmentoverdue).$promise;
            $rootScope.loading = true;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.shipmentoverdue = result;
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function toggleViewAlarmNotificationSubscribers(){
            $('#btn-viewalarm-notification-subscribers').blur();
            vm.viewalarm.isActiveForNotificationSubscribers = !vm.viewalarm.isActiveForNotificationSubscribers;
            var promise = ShipmentNotificationsService.updateViewAlarm(SentinelUiSession.focus, vm.viewalarm).$promise;
            $rootScope.loading = true;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.viewalarm = result;
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function toggleViewAlarmShipmentSubscribers() {
            $('#btn-viewalarm-shipment-subscribers').blur();
            vm.viewalarm.isActiveForShipmentSubscribers = !vm.viewalarm.isActiveForShipmentSubscribers;
            var promise = ShipmentNotificationsService.updateViewAlarm(SentinelUiSession.focus, vm.viewalarm).$promise;
            $rootScope.loading = true;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    vm.viewalarm = result;
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }      
        
        function toggleViewAlarmForSubscriber(subscriber){
            console.log("Before:",subscriber,"isactive",vm.viewalarm.isActiveForShipmentSubscribers);
            $('#btn-viewalarm-' + subscriber.id).blur();
            if(subscriber.isViewAlarmOn) {
                subscriber.notifications = subscriber.notifications.filter(function(value) {
                    return value.toLowerCase() !== 'viewalarm';
                });
            } else{
                subscriber.notifications.push('ViewAlarm');
            }
            var promise = ShipmentNotificationsService.updateContact(SentinelUiSession.focus, subscriber).$promise;
            $rootScope.loading = true;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    subscriber.isViewAlarmOn = !subscriber.isViewAlarmOn;
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function toggleCompletedForSubscriber(subscriber) {
            console.log("Before:",subscriber);
            $('#btn-completed-' + subscriber.id).blur();
            if (subscriber.isShipmentCompletedOn) {
                subscriber.notifications = subscriber.notifications.filter(function(value) {
                    return value.toLowerCase() !== 'shipmentcompleted';
                });
            }
            else {
                subscriber.notifications.push('ShipmentCompleted');
            }

            var promise = ShipmentNotificationsService.updateContact(SentinelUiSession.focus, subscriber).$promise;
            $rootScope.loading = true;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    subscriber.isShipmentCompletedOn = !subscriber.isShipmentCompletedOn;
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function toggleCreatedForSubscriber(subscriber) {
            console.log("Before:",subscriber);
            $('#btn-created-' + subscriber.id).blur();
            if (subscriber.isShipmentCreatedOn) {
                subscriber.notifications = subscriber.notifications.filter(function(value) {
                    return value.toLowerCase() !== 'shipmentcreated';
                });
            }
            else {
                subscriber.notifications.push('ShipmentCreated');
            }

            var promise = ShipmentNotificationsService.updateContact(SentinelUiSession.focus, subscriber).$promise;
            $rootScope.loading = true;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    subscriber.isShipmentCreatedOn = !subscriber.isShipmentCreatedOn;
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function toggleOverdueForSubscriber(subscriber) {
            console.log("Before:",subscriber,"Active");
            $('#btn-overdue-' + subscriber.id).blur();
            if (subscriber.isShipmentOverdueOn) {
                subscriber.notifications = subscriber.notifications.filter(function(value) {
                    return value.toLowerCase() !== 'shipmentoverdue';
                });
            }
            else {
                subscriber.notifications.push('ShipmentOverdue');
            }
            console.log(subscriber);
            var promise = ShipmentNotificationsService.updateContact(SentinelUiSession.focus, subscriber).$promise;
            $rootScope.loading = true;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    subscriber.isShipmentOverdueOn = !subscriber.isShipmentOverdueOn;
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function toggleArrivalForSubscriber(subscriber) {
            console.log("Before:",subscriber);
            $('#btn-arrival-' + subscriber.id).blur();
            if (subscriber.isStopArrivalOn) {
                subscriber.notifications = subscriber.notifications.filter(function(value) {
                    return value.toLowerCase() !== 'stoparrival';
                });
            }
            else {
                subscriber.notifications.push('StopArrival');
            }

            var promise = ShipmentNotificationsService.updateContact(SentinelUiSession.focus, subscriber).$promise;
            $rootScope.loading = true;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    subscriber.isStopArrivalOn = !subscriber.isStopArrivalOn;
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }        

        function toggleDepartureForSubscriber(subscriber) {
            console.log("Before:",subscriber);
            $('#btn-departure-' + subscriber.id).blur();
            if (subscriber.isStopDepartureOn) {
                subscriber.notifications = subscriber.notifications.filter(function(value) {
                    return value.toLowerCase() !== 'stopdeparture';
                });
            }
            else {
                subscriber.notifications.push('StopDeparture');
            }

            var promise = ShipmentNotificationsService.updateContact(SentinelUiSession.focus, subscriber).$promise;
            $rootScope.loading = true;
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    subscriber.isStopDepartureOn = !subscriber.isStopDepartureOn;
                },
                function (error) {
                    $rootScope.loading = false;
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function sortBy(propertyName) {
            vm.reverse = (vm.propertyName.toString() == propertyName.toString()) ? !vm.reverse : false;
            vm.propertyName = propertyName;
        }
    }
})();

