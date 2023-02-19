(function () {
    'use strict';

    angular
        .module('tracking.ui.common')
        .directive('mapIconImage', MapIconImageDirective);

    function MapIconImageDirective() {
        var directive = {
            restrict: 'A',
            scope: {
                severity: '@',
                locationMethod: '@',
                selected: '@'
            },
            template: '<img title="{{ mapIconTitle }}" class="{{ mapIconClass }}" ng-src="{{ mapIconSource }}"/>',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
            scope.mapIconSource = null;

            scope.$watch(
                function() {
                    return attrs;
                },
                function (value) {
                    if (!value) {
                        return;
                    }

                    scope.mapIconTitle = attrs.severity + '-' + (!attrs.locationMethod ? 'no-location' : attrs.locationMethod.toLowerCase()==='anchor' ? 'anchor-location' :
                            (attrs.locationMethod.toLowerCase() === 'gps' ? 'gps-location' : 'network-location'));

                    scope.mapIconClass = !attrs.locationMethod ? 'img-diamond' : attrs.locationMethod.toLowerCase()==='anchor' ? 'img-anchor' :
                        (attrs.locationMethod.toLowerCase() === 'gps' ? 'img-circle' : 'img-square');

                    scope.mapIconSource = '../img/' +  attrs.severity + '-' + (!attrs.locationMethod ? 'none' : attrs.locationMethod.toLowerCase()==='anchor' ? 'anchor' :
                        (attrs.locationMethod.toLowerCase() === 'gps' ? 'gps' : 'network') +
                        (attrs.selected === 'true' ? '-selected' : '')) + '.png';
                }, true
            );
        }
    }

})();