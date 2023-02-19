(function () {
    'use strict';

    angular
        .module('tracking.ui.common')
        .directive('timeFromNow', TimeFromNowDirective);

    function TimeFromNowDirective() {
        var directive = {
            restrict: 'A',
            scope: {
                utcDatetime: '@'
            },
            template: '{{ timeFromNow }}',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
            scope.timeFromNow = moment(attrs.utcDatetime).local().fromNow();
        }
    }

})();