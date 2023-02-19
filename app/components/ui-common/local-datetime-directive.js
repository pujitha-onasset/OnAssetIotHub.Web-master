(function () {
    'use strict';

    angular
        .module('ui-common')
        .directive('localDatetime', LocalDatetimeDirective);

    function LocalDatetimeDirective() {
        var directive = {
            restrict: 'A',
            scope: {
                utcDatetime: '@',
                dateFormat: '@',
                timeFormat: '@'
            },
            template: '{{ localDatetimeString }}',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
            scope.localDatetimeString = moment(attrs.utcDatetime).local().format(attrs.dateFormat + (attrs.timeFormat ? ' ' + attrs.timeFormat : ''));

            scope.$watch(
                function() {
                    return attrs;
                },
                function (value) {
                    if (!value.utcDatetime || (isNaN(value.utcDatetime) && isNaN(Date.parse(value.utcDatetime)))) {
                        scope.localDatetimeString = '';
                        return;
                    }

                    if (isNaN(value.utcDatetime)) {
                        scope.localDatetimeString = moment(value.utcDatetime).local().format(value.dateFormat + (value.timeFormat ? ' ' + value.timeFormat : ''));
                    } else {
                        scope.localDatetimeString = moment.unix(value.utcDatetime).local().format(value.dateFormat + (value.timeFormat ? ' ' + value.timeFormat : ''));
                    }
                }, true
            );
        }
    }

})();