(function () {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('AccountApiService', AccountApiService);

    AccountApiService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function AccountApiService($resource, HOST) {

        var api = $resource(HOST.URL + '/rest/1/account', {}, {
            getAccount: {  method: 'GET', url: HOST.URL + '/rest/1/account'},
            changeName: {  method: 'POST', url: HOST.URL + '/rest/1/account/changename'},
            listAccounts: {  method: 'GET', url: HOST.URL + '/rest/1/admin/accounts', isArray: true},
            changeNameForAccount: {  method: 'POST', params: { accountId: '@accountId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/changename'},
            changeaccesslevel: {  method: 'PUT', params: { accountId: '@accountId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/changeaccesslevel'},
            addAccount: {  method: 'POST', url: HOST.URL + '/rest/1/admin/accounts'},
            activateAccount: {method: 'POST', params: { accountId: '@accountId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/activate'},
            suspendAccount: {method: 'POST', params: { accountId: '@accountId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/suspend'},
            addSubAccount: {method: 'POST', url: HOST.URL + '/rest/1/admin/accounts'},
            listSubAccounts: {method: 'GET', url: HOST.URL + '/rest/1/admin/accounts/getsubaccounts', isArray: true},
            changeMasterAccount: {method: 'POST', params: { accountId: '@accountId'}, url: HOST.URL + '/rest/1/admin/accounts/{accountId}/changeMasterAccount'},
            deleteSubAccount: {method: 'DELETE', params: { accountId: '@accountId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/deleteSubAccount'},
            transferSentinels: {method: 'POST', params: { accountId: '@accountId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/transferSentinels'},
            transferSentrys: {method: 'POST', params: { accountId: '@accountId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/transferSentrys'},
            removeSubAccountSentinels: {method: 'POST', params: { accountId: '@accountId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/removesubaccountsentinels'},
            removeSubAccountSentries: {method: 'POST', params: { accountId: '@accountId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/removesubaccountsenties'},
            addEmailLogo: { method: 'POST', params: {accountId: '@accountId', fileType: '@fileType'}, url: HOST.URL + '/rest/1/images/UpdateAccountEmailLogoImage?accountId=:accountId&fileType=:fileType', transformRequest: []},
            getEmailLogo: { method: 'GET', params: {accountId: '@accountId'}, url: HOST.URL + '/rest/1/images/AccountImage?accountId=:accountId'},
            removeEmailLogo: { method: 'DELETE', params: {name: '@name'}, url: HOST.URL + '/rest/1/images/DeleteAccountImage?strFileName=:name'},
            changeShipmentConfiguration: {method: 'PUT', params: {accountId:'@accountId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/changeshipmentconfiguration'}
        });

        var service = {
            getAccount: getAccount,
            changeName: changeName,
            listAccounts: listAccounts,
            changeNameForAccount: changeNameForAccount,
            changeaccesslevel: changeaccesslevel,
            activateAccount: activateAccount,
            suspendAccount: suspendAccount,
            addAccount: addAccount,
            addSubAccount: addSubAccount,
            listSubAccounts: listSubAccounts,
            changeMasterAccount: changeMasterAccount,
            deleteSubAccount: deleteSubAccount,
            transferSentinels: transferSentinels,
            transferSentrys: transferSentrys,
            removeSubAccountSentinels: removeSubAccountSentinels,
            removeSubAccountSentries: removeSubAccountSentries,
            addEmailLogo: addEmailLogo,
            getEmailLogo: getEmailLogo,
            removeEmailLogo: removeEmailLogo,
            changeShipmentConfiguration: changeShipmentConfiguration
        };
        return service;

        //////////////////////////////////////////////////////////////////////////////////////////////////////

        function getAccount() {
            return api.getAccount();
        }

        function addAccount(name) {
            return api.addAccount(null,{ name: name });
        }

        function changeName(name) {
            return api.changeName(null,{ name: name });
        }

        function listAccounts() {
            return api.listAccounts();
        }

        function changeNameForAccount(account, name) {
            return api.changeNameForAccount({accountId: account.id},{ name: name });
        }

        function changeaccesslevel(account, accessLevel) {
            return api.changeaccesslevel({accountId: account.id},accessLevel);
        }

        function changeShipmentConfiguration(account, body){
            return api.changeShipmentConfiguration({accountId: account.id},body);
        }

        function activateAccount(account) {
            return api.activateAccount({accountId: account.id});
        }

        function suspendAccount(account) {
            return api.suspendAccount({accountId: account.id});
        }

        function addSubAccount(masterAccount, name) {
            return api.addSubAccount(null, {name: name, parentId: masterAccount.id});
        }

        function listSubAccounts(account) {
            return api.listSubAccounts({accountId: account.id});
        }

        function changeMasterAccount(account, masterAccount) {
            return api.listSubAccounts({accountId: account.id, masteraccountid: masterAccount.id});
        }

        function deleteSubAccount(account) {
            return api.deleteSubAccount({accountId: account.id});
        }

        function transferSentinels(account, deviceList) {
            return api.transferSentinels({accountId: account.id},{"sentinelIdNumbers":deviceList});
        }

        function transferSentrys(account, deviceList) {
            return api.transferSentrys({accountId: account.id},{"imeiNumbers":deviceList});
        }

        function removeSubAccountSentinels(account, deviceList) {
            return api.removeSubAccountSentinels({accountId: account.id},{"sentinelIdNumbers":deviceList});
        }

        function removeSubAccountSentries(account, deviceList) {
            return api.removeSubAccountSentries({accountId: account.id},{"imeiNumbers":deviceList});
        }

        function addEmailLogo(client, fileType, obj){
            var b64Data = obj.src.split(",")[1];
            var byteCharacters = atob(b64Data);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
			return api.addEmailLogo({accountId: client.id, fileType: fileType}, byteArray);
		}

         function getEmailLogo(client){
            return api.getEmailLogo({accountId: client.id});
        }

        function removeEmailLogo(name){
            return api.removeEmailLogo({name: name});
        }
    }

})();