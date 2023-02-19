(function () {
    'use strict';

    angular
        .module('ui-common')
        .directive('dateTimePicker', DateTimePickerDirective);

    function DateTimePickerDirective() {
        return {
            require: '?ngModel',
            restrict: 'AE',
            scope: {
                ngModel: '=',
                pick12HourFormat: '@',
                language: '@',
                useCurrent: '@',
                location: '@',
                format: '@',
                nomax: '@',
            },
            link: function (scope, elem, attrs, ngModel) {
                if (!ngModel) return;

                if (scope.nomax != "true") {
                    elem.datetimepicker({
                        pick12HourFormat: scope.pick12HourFormat,
                        language: scope.language,
                        useCurrent: scope.useCurrent,
                        format: scope.format,
                        maxDate: moment(),
                    });
                } else {
                    elem.datetimepicker({
                        pick12HourFormat: scope.pick12HourFormat,
                        language: scope.language,
                        useCurrent: scope.useCurrent,
                        format: scope.format,
                    });
                }

                //Local event change
                /*elem.on('blur', function () {
                    scope.ngModel = this.value;
                });*/

                elem.on('dp.change', function () {
                    ngModel.$setViewValue(this.value);
                });
            }
        };
    }

})();