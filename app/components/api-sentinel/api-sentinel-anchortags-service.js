(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('AnchortagsService', AnchortagsService);

    AnchortagsService.$inject = ['$resource', 'ApiToken', 'SENTINEL_API_HOST_CONSTANTS'];
    function AnchortagsService($resource, ApiToken, HOST) {
        var api = $resource(HOST.URL + '/SentinelLogTag', {}, {
            getAnchorTagsBySentinel: { method: 'GET', url: HOST.URL + '/SentinelAnchorTag/GetSentinelAnchorTagBySentinelID', headers: {'Authorization': 'Bearer ' + ApiToken.get().token}},
            postAnchorTagsBySentinel: { method: 'POST', url: HOST.URL + '/SentinelAnchorTag/EditSentinelAnchorTagBySentinelID', headers: {'Authorization': 'Bearer ' + ApiToken.get().token}},
            searchBySentinelId: { method: 'GET',params: { pattern: '@pattern' }, url: HOST.URL + '/SentinelAnchorTag/GetSentinelAnchorTagListBySentinelID?pattern=:pattern', isArray:true, headers: {'Authorization': 'Bearer ' + ApiToken.get().token}},
        });

        var service = {
            getAnchorTagsBySentinel: getAnchorTagsBySentinel,
            postAnchorTagsBySentinel: postAnchorTagsBySentinel,
            searchBySentinelId: searchBySentinelId
        };

        return service;

        function getAnchorTagsBySentinel(sentinelId) {
            return api.getAnchorTagsBySentinel({ sentinelId: sentinelId });
        }

        function postAnchorTagsBySentinel(anchortag) {
            return api.postAnchorTagsBySentinel({}, anchortag);
        }

        function searchBySentinelId(account,pattern) {
            return api.searchBySentinelId({pattern: pattern,accountId:account.id});
        }
    }

})();