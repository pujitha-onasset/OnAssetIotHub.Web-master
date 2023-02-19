(function() {
    'use strict';

    angular
        .module('api-rls')
        .factory('BranchService', BranchService);

    BranchService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];

     function BranchService($resource, HOST) {

        var api = $resource(HOST.URL + '/rest/1/branchmanagement', {}, {
            saveBranch: { method: 'POST', params: {clientGuid: '@clientGuid'}, url: HOST.URL + '/rest/1/branchmanagement/PostHomeBranch?clientGuid=:clientGuid' },
            getBranches: { method: 'GET', params: {clientGuid: '@clientGuid'},  url: HOST.URL + '/rest/1/branchmanagement/GetActiveHomeBranchList/:clientGuid', isArray: true},
            getBranch: { method: 'GET', params: { clientGuid: '@clientGuid', branchId: '@branchId'}, url: HOST.URL + '/rest/1/branchmanagement/GetHomeBranchById?branchId=:branchId'},
            updateBranch: { method: 'PUT', params: { clientGuid: '@clientGuid', branchId: '@branchId' }, url: HOST.URL + '/rest/1/branchmanagement/PutHomeBranch?clientGuid=:clientGuid'},
            removeBranch: { method: 'DELETE', params: { clientGuid:'@clientGuid', branchId: '@branchId' }, url: HOST.URL + '/rest/1/branchmanagement/DeleteHomeBranch?branchId=:branchId'}
        });

        //decided to return a service definition instead of the resource so that UI developer
        //can be abstracted from details of $resource and request logic can be encapsulated if necessary
        var service = {
            saveBranch: saveBranch,
            getBranches: getBranches,
            getBranch: getBranch,
            updateBranch: updateBranch,
            removeBranch: removeBranch,
            resource: api
        };

        return service;

        function saveBranch(client, branch) {
            return api.saveBranch({ clientGuid: client.id }, branch);
        }

        function getBranches(client) {
            return api.getBranches({ clientGuid: client.id });
        }

        function getBranch(client, branchId) {
            return api.getBranch({ clientGuid: null, branchId: branchId });
        }

        function updateBranch(client, branch) {
            return api.updateBranch({clientGuid: client.id, branchId: branch.id }, branch);
        }

        function removeBranch(client, branch) {
            return api.removeBranch({ clientGuid: client.id, branchId: branch.id });
        }

    }

})();
