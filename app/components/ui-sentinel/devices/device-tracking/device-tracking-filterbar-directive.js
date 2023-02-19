(function () {
    'use strict';

    angular
        .module('ui-sentinel.devices.deviceTracking')
        .directive('deviceTrackingFilterbar', DeviceTrackingFilterbar);

    function DeviceTrackingFilterbar() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'deviceTrackingFilterbar',
            templateUrl: 'ui-sentinel-devices.deviceTracking/device-tracking-filterbar-directive.html'
        };
        return directive;
    }

    ThisDirectiveController.$inject = ['$scope', '$state', 'DeviceTrackingReportsService', 'DeviceTrackingFilterService', 'DatetimeValidatorService'];
    function ThisDirectiveController($scope, $state, DeviceTrackingReportsService, DeviceTrackingFilterService, DatetimeValidatorService) {
        var vm = {
            reportsService: DeviceTrackingReportsService,
            filter: DeviceTrackingFilterService,
            error: null,
            fromDate: {
                label: null,
                date: null,
                time: null,
                value: null,
                error: null
            },
            toDate: {
                label: null,
                date: null,
                time: null,
                value: null,
                error: null
            },
            toggleSeverity: toggleSeverity,
            toggleProperty: toggleProperty,
            toggleDateRangeForm: toggleDateRangeForm,
            resetPropertyFilter: resetPropertyFilter,
            navToDeviceMap: navToDeviceMap,
            navToDeviceReports: navToDeviceReports,
            navToDeviceSummary: navToDeviceSummary,
            submitDateRange: submitDateRange,
            resetDateRange: resetDateRange,
            refresh: refresh
        };

        activate();
        return vm;

        ////////////////////////////////////////////////////////////////////////////

        function activate() {
            $('#deviceTrackingFromDate').datepicker();
            $('#deviceTrackingFromTime').timepicker({ 'timeFormat': DatetimeValidatorService.localTimeFormat()});
            $('#deviceTrackingToDate').datepicker();
            $('#deviceTrackingToTime').timepicker({ 'timeFormat': DatetimeValidatorService.localTimeFormat()});

            $scope.$watch(
                function() {
                    return vm.reportsService.fromDate;
                },
                function (date) {
                    refreshFromDate(date);
                }, true
            );
            $scope.$watch(
                function() {
                    return vm.reportsService.toDate;
                },
                function (date) {
                    refreshToDate(date);
                }, true
            );            
        }

        function refresh() {
            vm.reportsService.load(vm.reportsService.fromDate, vm.reportsService.toDate, true);
        }

        function refreshFromDate(date) {
            if (!date) {
                vm.fromDate.label = 'null';
                vm.fromDate.value = null;
                vm.fromDate.date = null;
                vm.fromDate.time = null;
                return;
            }

            var dateMoment = moment(date).startOf('minute');
            vm.fromDate.value = dateMoment.toDate();
            vm.fromDate.date = dateMoment.format('L');
            vm.fromDate.time = dateMoment.format('LT');
            vm.fromDate.label = dateMoment.format('L LT');
        }

        function refreshToDate(date) {
            if (!date) {
                vm.toDate.label = 'null';
                vm.toDate.value = null;
                vm.toDate.date = null;
                vm.toDate.time = null;
                return;
            }

            var dateMoment = moment(date).startOf('minute');
            vm.toDate.value = dateMoment.toDate();
            vm.toDate.date = dateMoment.format('L');
            vm.toDate.time = dateMoment.format('LT');
            vm.toDate.label = dateMoment.format('L LT');
        }

        function resetDateRange() {
            vm.fromDate.error = null;
            vm.toDate.error = null;
            vm.error = null;
            refreshFromDate(vm.reportsService.fromDate);
            refreshToDate(vm.reportsService.toDate);
        }

        function resetPropertyFilter() {
            vm.filter.range.above = vm.filter.range.min;
            vm.filter.range.below = vm.filter.range.max;
            vm.filter.range.from = vm.filter.range.min;
            vm.filter.range.to = vm.filter.range.max;
            $('#btn-reset-property').blur();
        }


        function submitDateRange() {
            validateDateRange();

            if (vm.fromDate.error || vm.toDate.error) {
                return;
            }

            vm.reportsService.load(vm.fromDate.value, vm.toDate.value);
        }        
        
        function toggleDateRangeForm() {
            vm.fromDate.error = null;
            vm.toDate.error = null;
            vm.error = null;

            refreshFromDate(vm.reportsService.fromDate);
            refreshToDate(vm.reportsService.toDate);
            vm.showDateRangeForm = !vm.showDateRangeForm;
        }        
        
        function toggleProperty() {
            vm.filter.range.enabled = !vm.filter.range.enabled;
            $('#btn-property').blur();
        }

        function toggleSeverity(severity) {
            switch (severity) {
                case 'ok':
                    vm.filter.showOk = !vm.filter.showOk;
                    break;
                case 'info':
                    vm.filter.showInfo = !vm.filter.showInfo;
                    break;
                case 'warning':
                    vm.filter.showWarning = !vm.filter.showWarning;
                    break;
            }
            $('#btn-' + severity).blur();
        }

        function navToDeviceMap() {
            $state.go('device.map', { deviceTagId: $state.params.deviceTagId });
        }

        function navToDeviceReports() {
            $state.go('device.reports', { deviceTagId: $state.params.deviceTagId });
        }

        function navToDeviceSummary() {
            $state.go('device.summary', { deviceTagId: $state.params.deviceTagId });
        }

        function validateDateRange() {
            vm.fromDate.error = null;
            vm.toDate.error = null;
            vm.error = null;

            var fromDateMoment = DatetimeValidatorService.toMoment(vm.fromDate.date, vm.fromDate.time);
            if (!fromDateMoment) {
                vm.fromDate.error = true;
                vm.error = 'Start ' +  (DatetimeValidatorService.dateError || DatetimeValidatorService.timeError);
                return;
            }

            var toDateMoment = DatetimeValidatorService.toMoment(vm.toDate.date, vm.toDate.time);
            if (!toDateMoment) {
                vm.toDate.error = true;
                vm.error = 'End ' +  (DatetimeValidatorService.dateError || DatetimeValidatorService.timeError);
                return;
            }

            var oneYearAgo = moment().subtract(364, 'days');

            if (fromDateMoment.isBefore(oneYearAgo)) {
                vm.fromDate.error = true;
                vm.error = 'Start date cannot be before ' + oneYearAgo.format('L LT');
                return;
            }

            var fortyFiveDaysAfter = moment(fromDateMoment).add(45, 'day');
            if (toDateMoment.isAfter(fortyFiveDaysAfter)) {
                vm.toDate.error = true;
                vm.error = 'End date cannot be after ' + fortyFiveDaysAfter.format('L LT');
                return;
            }

            if (toDateMoment.isSame(fromDateMoment) || toDateMoment.isBefore(fromDateMoment)) {
                vm.toDate.error = true;
                vm.error = 'End date must be after ' + fromDateMoment.format('L LT');
                return;
            }

            vm.fromDate.value = fromDateMoment.toDate();
            vm.toDate.value = toDateMoment.toDate();
        }

    }
})();