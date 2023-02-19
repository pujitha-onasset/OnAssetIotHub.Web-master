(function () {
    'use strict';

    angular
        .module('ui-rls.branches')
        .factory('BranchesFilterService', BranchesFilterService);

    BranchesFilterService.$inject = [];
    function BranchesFilterService() {

        var service = {
            searchText: null,
            filter: filter
        };
        return service;

        function filter(branch) {
            var isTextMatch = true;
            if (service.searchText) {
                isTextMatch = (
                    branch.name.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    branch.address.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1 ||
                    (branch.description !== null && branch.description.toLowerCase().indexOf(service.searchText.toLowerCase()) > -1)
                );
            }

            return isTextMatch;
        }
    }

})();
