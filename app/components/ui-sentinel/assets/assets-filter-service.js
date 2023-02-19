(function () {
    'use strict';

    angular
        .module('ui-sentinel.assets')
        .factory('AssetsFilterService', AssetsFilterService);

    AssetsFilterService.$inject = [];
    function AssetsFilterService() {

        var service = {
            searchText: null,
            filter: filter
        };
        return service;

        function filter(asset) {
            var isTextMatch = true;
            if (service.searchText) {
                isTextMatch = (
                    asset.assetName.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    asset.assetType.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    (asset.assetNotes !== null && asset.assetNotes.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1)
                );
            }

            return isTextMatch;
        }
    }

})();