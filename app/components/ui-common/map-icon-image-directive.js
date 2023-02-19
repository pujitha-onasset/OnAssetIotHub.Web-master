(function () {
    'use strict';

    angular
        .module('ui-common')
        .directive('mapIconImage', MapIconImageDirective);

    function MapIconImageDirective() {
        var directive = {
            restrict: 'A',
            scope: {
                severity: '@',
                locationMethod: '@',
                beaconType: '@',
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

                    scope.mapIconTitle = attrs.severity + '-' + (!attrs.locationMethod || attrs.locationMethod.toLowerCase() == 'none' ? 'no-location' :
                            (attrs.locationMethod.toLowerCase() === 'gps' ? 'gps-location' : 'network-location'));

                    scope.mapIconClass = !attrs.locationMethod || attrs.locationMethod.toLowerCase() == 'none' ? 'img-diamond' :
                        (attrs.locationMethod.toLowerCase() === 'gps' ? 'img-circle' : 'img-square');
                    if(attrs.beaconType=="Sentinel 100A" || attrs.beaconType=="Mobile SDK Anchor")
                        scope.mapIconSource = '../img/' +  attrs.severity + '-anchor' + 
                        (attrs.selected === 'true' ? '-selected' : '') + '.png';
                    else
                       scope.mapIconSource = '../img/' +  attrs.severity + '-' + (!attrs.locationMethod  || attrs.locationMethod.toLowerCase() == 'none' ? 'none' :
                         attrs.locationMethod.toLowerCase()  +
                        (attrs.selected === 'true' ? '-selected' : '')) + '.png';
                }, true
            );
        }
    }

})();