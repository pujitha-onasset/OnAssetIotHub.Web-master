(function () {
    'use strict';

    angular
        .module('ui-sentinel.accounts')
        .directive('onFileChange', OnFileChangeDirective);

    function OnFileChangeDirective() {
        var directive = {
            restrict: 'A',
            scope: {
                onFileChange: '&'
            },
            link: link
        };
        return directive;

        function link(scope, element) {
            element.on('change', function() {
               scope.onFileChange();
            });
        }
    }

})();
