(function() {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('WatchlistsService', WatchlistsService);

    WatchlistsService.$inject = ['$resource', 'ApiToken', 'SENTINEL_API_HOST_CONSTANTS'];
    function WatchlistsService($resource, ApiToken, HOST) {
        var api = $resource(HOST.URL + '/rest/1/watchlists', {}, {
            getWatchlist: { method: 'GET', url: HOST.URL + '/rest/1/watchlist', isArray: true},
            getWatchlistCount: { method: 'GET', params: { sentinelId: '@sentinelId' }, url: HOST.URL + '/rest/1/watchlist/:sentinelId/count'},
            postWatchlist: { method: 'POST', url: HOST.URL + '/rest/1/watchlist'},
            putWatchlist: { method: 'PUT', params: { watchlistId: '@watchlistId' }, url: HOST.URL + '/rest/1/watchlist/:watchlistId'},
            deleteWatchlist: { method: 'DELETE', params: { watchlistId: '@watchlistId' }, url: HOST.URL + '/rest/1/watchlist/:watchlistId'},
            getWatchlistLogData: { method: 'GET', url: HOST.URL + '/SentinelLogTag/GetSightingsByWatchListId', headers: {'Authorization': 'Bearer ' + ApiToken.get().token}, isArray: true},
            getWatchlistLogDataCount: { method: 'GET', url: HOST.URL + '/SentinelLogTag/GetSightingsByWatchListIdCount', headers: {'Authorization': 'Bearer ' + ApiToken.get().token}},
            getWatchlistLoggersByClient: { method: 'GET', url: HOST.URL + '/rest/1/watchlist/sentinels/loggers/byclient', headers: {'Authorization': 'Bearer ' + ApiToken.get().token}, isArray: true},
            forceCompleteWatchlist: { method: 'PUT', params: { watchlistId: '@watchlistId' }, url: HOST.URL + '/rest/1/watchlist/:watchlistId/usercompleted'},
        });

        var service = {
            getWatchlist: getWatchlist,
            getWatchlistCount: getWatchlistCount,
            postWatchlist: postWatchlist,
            putWatchlist: putWatchlist,
            deleteWatchlist: deleteWatchlist,
            getWatchlistLogData: getWatchlistLogData,
            getWatchlistLogDataCount: getWatchlistLogDataCount,
            getWatchlistLoggersByClient:getWatchlistLoggersByClient,
            forceCompleteWatchlist: forceCompleteWatchlist,
        };

        return service;

        function getWatchlist(account,sentinelId, page, itemsPerPage) {
            return api.getWatchlist({accountId: account.id, sentinelId: sentinelId, page: page, itemsPerPage: itemsPerPage });
        }

        function getWatchlistCount(account,sentinelId, itemsPerPage) {
            return api.getWatchlistCount({ accountId: account.id, sentinelId: sentinelId, itemsPerPage: itemsPerPage });
        }

        function postWatchlist(sentinelId, watchlist) {
            return api.postWatchlist({ sentinelId: sentinelId }, watchlist);
        }

        function putWatchlist(watchlist) {
            return api.putWatchlist({ watchlistId: watchlist.id }, watchlist);
        }

        function deleteWatchlist(watchlist) {
            return api.deleteWatchlist({ watchlistId: watchlist.id });
        }

        function getWatchlistLogData(watchlistId, page, itemsPerPage, from, to) {
            if(from!=null){
                var fromDateIso = (from instanceof moment) ? from.toISOString() : moment(from).toISOString();
                var toDateIso = (to instanceof moment) ? to.toISOString() : moment(to).toISOString();

                return api.getWatchlistLogData({ watchlistId: watchlistId, page: page, itemsPerPage: itemsPerPage, from: fromDateIso, to: toDateIso });
            }else{

                return api.getWatchlistLogData({ watchlistId: watchlistId, page: page, itemsPerPage: itemsPerPage});
            
            }
                
        }

        function getWatchlistLogDataCount(watchlistId, itemsPerPage, from, to) {
            if(from!=null){
                var fromDateIso = (from instanceof moment) ? from.toISOString() : moment(from).toISOString();
                var toDateIso = (to instanceof moment) ? to.toISOString() : moment(to).toISOString();

                return api.getWatchlistLogDataCount({ watchlistId: watchlistId, itemsPerPage: itemsPerPage, from: fromDateIso, to: toDateIso });
        

            }else{
                  return api.getWatchlistLogDataCount({ watchlistId: watchlistId, itemsPerPage: itemsPerPage });
            }
        }

        function getWatchlistLoggersByClient(account, status, itemsPerPage, from, to){
            if(from === undefined)
                from = moment().subtract(8, 'day').startOf('day');
            if(to === undefined)
                to = moment().add(1, 'day').endOf('day');

            var fromDateIso = (from instanceof moment) ? from.toISOString() : moment(from).toISOString();
            var toDateIso = (to instanceof moment) ? to.toISOString() : moment(to).toISOString();

            return api.getWatchlistLoggersByClient({ clientGuid: account.id, itemsPerPage: itemsPerPage, from: fromDateIso, to: toDateIso , status: status}); 
        }

        function forceCompleteWatchlist(watchlist) {
            return api.forceCompleteWatchlist({ watchlistId: watchlist.id });
        }
    }

})();