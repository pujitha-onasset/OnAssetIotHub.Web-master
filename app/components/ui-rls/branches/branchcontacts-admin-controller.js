(function() {
    'use strict';

    angular
        .module('ui-rls.branches')
        .controller('BranchContactAdminController', BranchContactAdminController);

    BranchContactAdminController.$inject = ['$rootScope', '$state', '$stateParams', 'BranchContactService','BranchService', 'FeedbackService', 'RlsUiSession'];
    function BranchContactAdminController($rootScope, $state, $stateParams, BranchContactService,BranchService, FeedbackService, RlsUiSession) {
        var vm = {
            branchContact: null,
            branches:[],
            branch: {
                value: null,
                isPristine: true,
                hasError: function () {
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
            role: {
                value: null,
                isPristine: true,
                hasError: function () {
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
                hasError: function () {
                    return this.errors.isBlank || this.errors.isBadFormat;
                },
                errors: {
                    isBlank: true,
                    isBadFormat: false
                },
                validate: validateEmail
            },
            roles:[{id:1,name:"Tier 1"},{id:2,name:"Tier 2"}],
            isNew: false,
            isRemoving: false,
            feedback: FeedbackService,
            hasPermission: {
                toChange: false,
                toDelete: false
            },
            actions: {
                close: close,
                reset: reset,
                submit: submit,
                beginRemove: beginRemove,
                cancelRemove: cancelRemove,
                remove: remove
            }
        };
        activate();
        return vm;

        ////////////////////////////////////////////

        function activate() {
           

            setPermissions();

            var promise = BranchService.getBranch(RlsUiSession.focus,$stateParams.branchId).$promise;
            promise.then(
                function(result) {
                    vm.branch.value = result;
                    $state.current.data.subTitle =  "Branch:"+ vm.branch.value.name;
                },
                function (error) {
                    vm.feedback.addError(error.data.message);
                }
            );

            if ($stateParams.contactId) {
                load();
            } else {
                vm.isNew = true;
                reset();
            }
        }

        function beginRemove() {
            vm.isRemoving = true;
        }

        function cancelRemove() {
            vm.isRemoving = false;
        }

        function load() {
            $rootScope.loading = true;
            vm.branchContact = null;

            var promise = BranchContactService.getBranchContact(RlsUiSession.focus,$stateParams.branchId,$stateParams.contactId).$promise;
            promise.then(
                function(result) {
                    vm.branchContact = result;
                    reset();
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
        }

        function close() {
            vm.branchContact = null;
           
            $state.go($stateParams.referrer, $stateParams.referrerParams);
           
        }

        function reset() {
            if (!vm.branchContact) {
                vm.branch.value = {id:$stateParams.referrerParams.branchId};
                vm.role.value = null;
                vm.email.value = null;
            }
            else {
                //$state.current.data.subTitle = vm.branchContact.emailAddress;
                vm.role.value = vm.branchContact.roleId;
                vm.branch.value = {id:vm.branchContact.branchId};
                vm.email.value = vm.branchContact.emailAddress;
            }

            vm.role.isPristine = true;
            vm.role.errors.isBlank = true;

            vm.branch.isPristine = true;
            vm.branch.errors.isBlank = true;

            vm.email.isPristine = true;
            vm.email.errors.isBlank = true;
            vm.email.errors.isBadFormt = false;

        }

        function submit() {
            $rootScope.loading = true;
            vm.feedback.clear();

            vm.role.validate();
            vm.branch.validate();
            vm.email.validate();
          
            if (vm.role.hasError() || vm.branch.hasError() || vm.email.hasError() ) {
                return;
            }

            var branchContact = {               
                emailAddress: vm.email.value,
                roleId: vm.role.value,
                branchId: vm.branch.value.id
            };
            if (vm.branchContact) {
                branchContact.id = vm.branchContact.id;
            }

            var promise =  vm.isNew ?
                BranchContactService.saveBranchContact(RlsUiSession.focus,branchContact).$promise :
                BranchContactService.updateBranchContact(RlsUiSession.focus,branchContact).$promise;
            promise.then(
                function(result) {
                    vm.feedback.addSuccess(branchContact.emailAddress + ' has been ' + (vm.isNew ? 'created' : 'updated'));
                    if (vm.isNew) {
                       $state.go('branchcontact.admin', {branchId: branchContact.branchId, contactId: result.id, referrer: returnState, referrerParams: returnStateParams });
                       return;
                    }
                    vm.branchContact = result;
                    reset();
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
            vm.hasPermission.toChange = true;
             //   RlsUiSession.user.isSystemAdmin ||
                // RlsUiSession.user.isAccountAdmin ||
              //  RlsUiSession.user.isAccountEditor;

            vm.hasPermission.toDelete =true;
             //   RlsUiSession.user.isSystemAdmin ||
               // RlsUiSession.user.isAccountAdmin;
        }

        function remove() {
            $rootScope.loading = true;
            vm.feedback.clear();

            var promise = BranchContactService.removeBranchContact(RlsUiSession.focus,vm.branchContact.branchId,vm.branchContact.id).$promise;
            promise.then(
                function(result) {
                    vm.feedback.addSuccess(vm.branchContact.emailAddress + ' has been deleted');
                    vm.branchContact = null;
                    $state.go($stateParams.referrer, $stateParams.referrerParams);
                },
                function (error) {
                    console.log(error);
                    vm.feedback.addError(error.data.message);
                }
            ).finally(function(){
                $rootScope.loading = false;
            });
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
    }
})();