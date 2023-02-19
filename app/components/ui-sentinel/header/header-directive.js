(function() {
    'use strict';

    angular
        .module('ui-sentinel.header')
        .directive('sentinelUiHeader', HeaderDirective);

    HeaderDirective.$inject = [];
    function HeaderDirective() {
        var directive = {
            restrict: 'A',
            templateUrl: 'ui-sentinel-header/header-directive.html'
        };
        return directive;
    }
})();