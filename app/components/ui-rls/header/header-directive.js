(function() {
    'use strict';

    angular
        .module('ui-rls.header')
        .directive('rlsUiHeader', RlsHeaderDirective);

    RlsHeaderDirective.$inject = [];
    function RlsHeaderDirective() {
        var directive = {
            restrict: 'A',
            templateUrl: 'ui-rls-header/header-directive.html'
        };
        return directive;
    }
})();