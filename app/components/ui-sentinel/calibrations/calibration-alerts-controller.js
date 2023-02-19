(function() {
    'use strict';

    angular
        .module('ui-sentinel.calibrations')
        .controller('CalibrationAlertsController', CalibrationAlertsController);

    CalibrationAlertsController.$inject = ['$rootScope', 'SentinelUiSession', 'FeedbackService', 'AlarmContactsService', 'AlarmCalibrationService'];
    function CalibrationAlertsController($rootScope, SentinelUiSession, FeedbackService, AlarmContactsService, AlarmCalibrationService) {

        //NOTE: proper camelcase is avoided here to support dynamic allocation based upon notification objects
        var vm = {
            subscribers: [],
            feedback: FeedbackService,
            hasPermission: {
                toChange: false
            },
            actions: {
                subscriber: {
                    toggleEnableAlertForSubscriber: toggleEnableAlertForSubscriber,
                    toggleDaysBeforeNextCalibrationForSubscriber: toggleDaysBeforeNextCalibrationForSubscriber,
                    toggleEmailAlertForSubscriber: toggleEmailAlertForSubscriber,
                    toggleSmsAlertForSubscriber: toggleSmsAlertForSubscriber
                }
            },
            propertyName: ['lastname', 'firstname'],
            reverse: false,
            sortBy: sortBy,
        };
        activate();
        return vm;

        function activate() {
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'calibrations.alerts') {
                    load();
                }
            });

            setPermissions();
            load();
        }

        function load() {
            vm.subscribers = [];

            $rootScope.loading = true;

            loadSubscribers();

        }

        function loadSubscribers() {
            var contactsPromise = AlarmContactsService.getContacts(SentinelUiSession.focus).$promise;
            contactsPromise.then(
                function(result) {
                    loadAlarmsSettings(result);
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                    $rootScope.loading = false;
                }
            );
        }

        function loadAlarmsSettings(subscribers){
            var alarmSettingsPromise = AlarmCalibrationService.getAlarmCalibration(SentinelUiSession.focus).$promise;
            var subscribersTemp=[];
            alarmSettingsPromise.then(
                function(result) {
                    console.log("getAlarmCalibration",result);
                     $rootScope.loading = false;


                    _.forEach(subscribers, function(subscriber) {
                        var alarmCalibration = _.find(result, function(item){
                           return item.alarmContactId == subscriber.contactId;
                        });
                        
                        subscriber = angular.extend(subscriber, {
                            enableAlert: alarmCalibration ? alarmCalibration.enableAlert : false,
                            daysBeforeNextCalibration: alarmCalibration ? alarmCalibration.daysBeforeNextCalibration : 10,
                            emailAlert: alarmCalibration ? alarmCalibration.emailAlert : false,
                            smsAlert: alarmCalibration ? alarmCalibration.smsAlert : false,
                            isNew: !alarmCalibration || alarmCalibration.id == null
                        });

                        subscribersTemp.push(subscriber);


                    });
                    vm.subscribers = subscribersTemp;
                    console.log("subscribers",vm.subscribers);
                        
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                    $rootScope.loading = false;
                }
            );
        }

        function setPermissions() {
            vm.hasPermission.toChange =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;
        }

        

        

        function toggleEnableAlertForSubscriber(subscriber) {
            $('#btn-enableAlert-' + subscriber.id).blur();
            

            var data = {
                  "alarmContactId": subscriber.contactId,
                  "enableAlert": !subscriber.enableAlert,
                  "daysBeforeNextCalibration": subscriber.daysBeforeNextCalibration,
                  "emailAlert": subscriber.emailAlert,
                  "smsAlert": subscriber.smsAlert
                };
            
            var promise = subscriber.isNew ?  AlarmCalibrationService.create(SentinelUiSession.focus, data).$promise  : 
                AlarmCalibrationService.update(SentinelUiSession.focus, data).$promise;
            console.log(subscriber);
            promise.then(
                function(response) {
                   loadSubscribers();
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function toggleDaysBeforeNextCalibrationForSubscriber(subscriber,days) {
           if(!days)
             return;
            var data = {
                  "alarmContactId": subscriber.contactId,
                  "enableAlert": subscriber.enableAlert,
                  "daysBeforeNextCalibration": days,
                  "emailAlert": subscriber.emailAlert,
                  "smsAlert": subscriber.smsAlert
                };
            
            var promise = subscriber.isNew ?  AlarmCalibrationService.create(SentinelUiSession.focus, data).$promise  : 
                AlarmCalibrationService.update(SentinelUiSession.focus, data).$promise;
                
            promise.then(
                function(result) {
                     subscriber.daysBeforeNextCalibration = days;
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function toggleEmailAlertForSubscriber(subscriber) {
            $('#btn-emailAlert-' + subscriber.id).blur();
            

            var data = {
                  "alarmContactId": subscriber.contactId,
                  "enableAlert": subscriber.enableAlert,
                  "daysBeforeNextCalibration": subscriber.daysBeforeNextCalibration,
                  "emailAlert": !subscriber.emailAlert,
                  "smsAlert": subscriber.smsAlert
                };
            
            var promise = subscriber.isNew ?  AlarmCalibrationService.create(SentinelUiSession.focus, data).$promise  : 
                AlarmCalibrationService.update(SentinelUiSession.focus, data).$promise;
                
            promise.then(
                function(result) {
                    subscriber.emailAlert = !subscriber.emailAlert;
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );
        }

        function toggleSmsAlertForSubscriber(subscriber) {
            $('#btn-smsAlert-' + subscriber.id).blur();
           
           var data = {
                  "alarmContactId": subscriber.contactId,
                  "enableAlert": subscriber.enableAlert,
                  "daysBeforeNextCalibration": subscriber.daysBeforeNextCalibration,
                  "emailAlert": subscriber.emailAlert,
                  "smsAlert": !subscriber.smsAlert
                };
            
            $rootScope.loading = true;
            var promise = subscriber.isNew ?  AlarmCalibrationService.create(SentinelUiSession.focus, data).$promise  : 
                AlarmCalibrationService.update(SentinelUiSession.focus, data).$promise;
                
            promise.then(
                function(result) {
                    $rootScope.loading = false;
                    subscriber.smsAlert = !subscriber.smsAlert;
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

