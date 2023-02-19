(function () {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('LoginsApiService', LoginsApiService);

    LoginsApiService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function LoginsApiService($resource, HOST) {

        var api = $resource(HOST.URL + '/rest/1/logins', {}, {
            getCurrent: {  method: 'GET', url: HOST.URL + '/rest/1/logins/current'},
            listLogins: {  method: 'GET', url: HOST.URL + '/rest/1/admin/logins', isArray: true},
            listLoginsByClient: {  method: 'GET', params: {accountId: '@accountId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/logins ', isArray: true},
            addLogin: {  method: 'POST', params: {accountId: '@accountId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/logins'},
            deleteLogin: {  method: 'DELETE', params: {accountId: '@accountId', loginId: '@loginId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/logins/:loginId'},
            changeCurrentUserPassword: { method: 'POST', params: { loginId: '@loginId'},  url: HOST.URL + '/rest/1/logins/:loginId/changepassword'},
            changeCurrentUserName: { method: 'POST', params: { loginId: '@loginId'},  url: HOST.URL + '/rest/1/logins/:loginId/changename'},
            changeNameForLogin: {  method: 'POST', params: { accountId: '@accountId', loginId: '@loginId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/logins/:loginId/changename'},
            changeRoleForLogin: {  method: 'POST', params: { accountId: '@accountId', loginId: '@loginId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/logins/:loginId/UpdateLoginRole'},
            setPasswordForLogin: {  method: 'POST', params: { accountId: '@accountId', loginId: '@loginId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/logins/:loginId/setpassword'},
            getAvailableRoles: { method: 'GET', params: { loginId: '@loginId'}, url: HOST.URL + '/rest/1/admin/logins/roles/:loginId', isArray: true},
            revokeAccess: {method: 'POST', params: { loginId: '@loginId'},  url: HOST.URL + '/rest/1/admin/logins/:loginId/revoke'},
            grantAccess: {method: 'POST', params: { loginId: '@loginId'},  url: HOST.URL + '/rest/1/admin/logins/:loginId/grant'},
            agreedEULAA: {method: 'POST', params: { loginId: '@loginId'},  url: HOST.URL + '/rest/1/logins/PostEULAAgreementByLoginId'},
            resetPassword: { method: 'POST', params: { userGuid: '@userGuid'},  url: HOST.URL + '/rest/1/logins/:userGuid/resetpassword'},
            forgotPassword: { method: 'POST', url: HOST.URL + '/rest/1/logins/reset/forgotpassword'},
            confirmResetToken:  { method: 'POST', url: HOST.URL + '/rest/1/logins/reset/confirmResetToken'},

        });

        var service = {
            addLogin: addLogin,
            changeCurrentUserPassword: changeCurrentUserPassword,
            changeCurrentUserName: changeCurrentUserName,
            changeNameForLogin: changeNameForLogin,
            changeRoleForLogin: changeRoleForLogin,
            deleteLogin: deleteLogin,
            getAvailableRoles: getAvailableRoles,
            getCurrent: getCurrent,
            grantAccess: grantAccess,
            listLogins: listLogins,
            listLoginsByClient:listLoginsByClient,
            revokeAccess: revokeAccess,
            setPasswordForLogin: setPasswordForLogin,
            agreedEULAA:agreedEULAA,
            forgotPassword: forgotPassword,
            resetPassword: resetPassword,
            confirmResetToken: confirmResetToken
        };
        return service;

        //////////////////////////////////////////////////////////////////////////////////////////////////////

        function addLogin(account, name, password, role) {
            return api.addLogin({accountId: account.id},{ userName: name, password: password, role: role, lockoutEnabled: true });
        }

        function changeCurrentUserPassword(login, currentPassword, newPassword) {
            return api.changeCurrentUserPassword({loginId: login.id}, {currentPassword: currentPassword, newPassword: newPassword});
        }
        function changeCurrentUserName(login, userName) {
            return api.changeCurrentUserName({accountId: login.accountId, loginId: login.id}, {userName: userName});
        }

        function changeNameForLogin(login, name) {
            return api.changeNameForLogin({accountId: login.accountId, loginId: login.id},{ userName: name });
        }

        function changeRoleForLogin(login, role) {
            return api.changeRoleForLogin({accountId: login.accountId, loginId: login.id},{ UserRole: role });
        }

        function deleteLogin(login) {
            return api.deleteLogin({accountId: login.accountId, loginId: login.id});
        }

        function getAvailableRoles(login) {
            return api.getAvailableRoles({loginId: login.id});
        }

        function getCurrent() {
            return api.getCurrent();
        }

        function grantAccess(login) {
            return api.grantAccess({loginId: login.id});
        }

        function listLogins() {
            return api.listLogins();
        }

        function listLoginsByClient(account) {
            return api.listLoginsByClient({accountId:account.id});
        }

        function revokeAccess(login) {
            return api.revokeAccess({loginId: login.id});
        }

        function setPasswordForLogin(login, password) {
            return api.setPasswordForLogin({accountId: login.accountId, loginId: login.id},{ newPassword: password });
        }

        function agreedEULAA(login) {
            return api.agreedEULAA({loginId:login.id});
        }

        function resetPassword(user) {
            return api.resetPassword({ userGuid: user.id });
        }

        function forgotPassword(email) {
            return api.forgotPassword({ email: email });
        }

        function confirmResetToken(email, token, password) {
            return api.confirmResetToken({ email: email, token: token, password: password });
        }


    }

})();