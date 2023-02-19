(function() {
    'use strict';

    angular
        .module('ui-sentinel.alarms')
        .controller('AlarmContactsListController', AlarmContactsListController);

    AlarmContactsListController.$inject = ['$rootScope', 'SentinelUiSession', 'AlarmContactsService', 'FeedbackService'];
    function AlarmContactsListController($rootScope, SentinelUiSession, AlarmContactsService, FeedbackService) {
        var vm = {
            session: SentinelUiSession,
            list: null,
            feedback: FeedbackService,
            hasPermission: {
                toCreate: false
            },
            filterText: null,
            filter: filter,
            propertyName: ['lastname', 'firstname'],
            reverse: false,
            sortBy: sortBy,

        };
        activate();
        return vm;

        function activate() {
            $rootScope.$on('CLIENT_FOCUS_CHANGED', function (event, args) {
                if ($rootScope.$state.current.name == 'alarmcontacts.list') {
                    load();
                }
            });
            setPermissions();
            load();
        }

        function filter(contact) {
            if (!vm.filterText) {
                return true;
            }
            var filterText = vm.filterText.toLowerCase();

            return (contact.firstname && contact.firstname.toLowerCase().indexOf(filterText) > -1) ||
                (contact.lastname && contact.lastname.toLowerCase().indexOf(filterText) > -1) ||
                (contact.emailAddress && contact.emailAddress.toLowerCase().indexOf(filterText) > -1) ||
                (contact.smsAddress && contact.smsAddress.toLowerCase().indexOf(filterText) > -1);
        }

        function load() {
            $rootScope.loading = true;
            vm.list = null;
            var promise =  (SentinelUiSession.user.accountId==SentinelUiSession.focus.id)? 
                AlarmContactsService.getContacts().$promise :
                AlarmContactsService.getContactsForClient(SentinelUiSession.focus).$promise; 
                    
            promise.then(
                function(result) {
                    vm.list = result;
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function setPermissions() {
            vm.hasPermission.toCreate =
                SentinelUiSession.user.isSystemAdmin ||
                SentinelUiSession.user.isAccountAdmin ||
                SentinelUiSession.user.isAccountEditor;
        }

        function sortBy(propertyName) {
            vm.reverse = (vm.propertyName.toString() == propertyName.toString()) ? !vm.reverse : false;
            vm.propertyName = propertyName;
        }
    }
})();

