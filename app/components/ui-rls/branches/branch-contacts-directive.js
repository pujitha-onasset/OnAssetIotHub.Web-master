(function () {
    'use strict';

    angular
        .module('ui-rls.branches')
        .directive('branchContacts', BranchContactsDirective);

    function BranchContactsDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'branchContacts',
            templateUrl: 'ui-rls-branches/branch-contacts-directive.html',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
            scope.$watch(
                function(scope) {
                    return scope.branchAdmin.branch;
                },
                function (newValue, oldValue) {
                    controller.branch = newValue;
                }, true
            );
        }    }

    ThisDirectiveController.$inject = ['$rootScope', '$state', 'BranchContactService', 'FeedbackService', 'RlsUiSession'];
    function ThisDirectiveController($rootScope, $state, BranchContactService, FeedbackService, RlsUiSession) {
        var vm = {
            branch: null,
            contacts: {
                assigned: [],
                available: [],
                removable: []
            },
            actions: {
                beginAdd: beginAdd,
                beginRemove: beginRemove,
                endRemove: endRemove,
                remove: remove,
                goToContact: goToContact,
                reload: load
            },
            mode: {
                isAdding: false,
                isRemoving: false
            },
            panel: {
                isCollapsed: true,
                toggle: function () {
                    this.isCollapsed = !this.isCollapsed;
                    if (!this.isCollapsed) { load(); }
                }
            },
            feedback: FeedbackService,
            hasPermission: {
                toChange: false
            }
        };
        activate();
        return vm;

        function activate() {
            setPermissions();
        }

      

        function beginAdd() {
           var returnState = $state.current.name;
           var returnStateParams = $state.params;
           $state.go('branchcontact.new', { branchId: vm.branch.id, referrer: returnState, referrerParams: returnStateParams } ); 
        }

        
        function beginRemove() {
            vm.mode.isRemoving = true;
            vm.contacts.removable = [];

            var removable = [];
            _.forEach(vm.contacts.assigned, function (contact) {
                removable.push(angular.extend(contact, { isRemoved: false }));
            });

            vm.contacts.removable = removable;
        }

        function endRemove() {
            vm.mode.isRemoving = false;
            vm.contacts.removable = [];
            load();
        }

        function goToContact(contact) {
            var returnState = $state.current.name;
            var returnStateParams = $state.params;
            $state.go('branchcontact.admin', {branchId:vm.branch.id, contactId: contact.id, referrer: returnState, referrerParams: returnStateParams } );
        }

        function remove(contact) {
            $rootScope.loading = true;
            vm.feedback.clear();

            var promise = BranchContactService.removeBranchContact(RlsUiSession.focus,vm.branch.id, contact.id).$promise;
            promise.then(
                function(result) {
                    vm.contacts.assigned = result;
                    contact.isRemoved = true;
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function load() {
            $rootScope.loading = true;
            vm.contacts.assigned = [];
            var promise = BranchContactService.getBranchContacts(RlsUiSession.focus,vm.branch.id).$promise;
            promise.then(
                function(result) {
                    vm.contacts.assigned = result;
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
            vm.hasPermission.toChange =
                RlsUiSession.user.isSystemAdmin ||
                RlsUiSession.user.isAccountAdmin ||
                RlsUiSession.user.isAccountEditor;
        }
    }

})();