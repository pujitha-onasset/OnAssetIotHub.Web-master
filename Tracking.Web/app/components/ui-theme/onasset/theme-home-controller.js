(function() {
    'use strict';

    angular
        .module('tracking.ui.theme')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$rootScope','$scope', '$state', 'TrackingApiService'];
    function HomeController ($rootScope, $scope, $state, TrackingApiService) {
        var vm = {
            referenceNumbers: {
                max: 10,
                value: null,  //'SYJMC\r\nSY ATC1\r\nSYATC 2',
                numbers: null,
                isPristine: true,
                hasError: function () {
                    return this.errors.isBlank || this.errors.hasToMany || this.errors.notFoundReferenceNumbers.length > 0;
                },
                errors: {
                    isBlank: true,
                    hasToMany: false,
                    notFoundReferenceNumbers: []
                },
                onChange: function () {
                    this.isPristine = true;
                },
                validate: validateReferenceNumbers
            },
            submit: submit,
            reset: reset,
            year:(new Date()).getFullYear()
        };
        activate();
        return vm;

        //////////////////////////////

        function activate() {
            var t = $state.params.t;

            if (t) {
                t = decodeURIComponent(t);
                vm.referenceNumbers.value = t.replace(',\g','\r\n');
                submit();
            }
        }

        function reset() {
            vm.referenceNumbers.value = null;
            vm.referenceNumbers.isPristine = true;
        }

        function submit() {
            $('#btn-submit').blur();
            vm.referenceNumbers.validate();

            if (vm.referenceNumbers.hasError()) {
                return;
            }

            var promise = TrackingApiService.search(vm.referenceNumbers.numbers).$promise;
            promise.then(
                function(results){
                    var notFoundReferenceNumbers = [];
                    var foundShipmentIds = [];
                    _.forEach(results, function(searchResult) {
                        if (!searchResult.found && _.indexOf(notFoundReferenceNumbers, searchResult.referenceNumber ) === -1) {
                            notFoundReferenceNumbers.push(searchResult.referenceNumber);
                        }

                        if (searchResult.found && _.indexOf(foundShipmentIds, searchResult.shipmentId ) === -1) {
                            foundShipmentIds.push(searchResult.shipmentId);
                        }
                    });

                    if (notFoundReferenceNumbers.length > 0) {
                        vm.referenceNumbers.errors.hasNotFound = true;
                        vm.referenceNumbers.errors.notFoundReferenceNumbers = notFoundReferenceNumbers;
                        return;
                    }

                    if (foundShipmentIds.length === 1) {
                        var shipmentId = foundShipmentIds[0];
                        var shipmentPromise = TrackingApiService.getShipment(shipmentId).$promise;
                        shipmentPromise.then(
                            function(shipment) {
                                $state.go('shipment.map', { shipmentId: shipmentId, shipment: shipment });
                            },
                            function(error) {
                                console.log(error);
                            }
                        );

                        return;
                    }
                    $state.go('shipments.map', { shipmentIds: foundShipmentIds });
                },
                function(error) {
                    console.log(error);
                }
            );

        }

        function validateReferenceNumbers() {
            vm.referenceNumbers.isPristine = false;
            vm.referenceNumbers.errors.isBlank = !vm.referenceNumbers.value || vm.referenceNumbers.value.trim().length === 0;
            vm.referenceNumbers.errors.hasToMany = false;
            vm.referenceNumbers.numbers = [];
            vm.referenceNumbers.errors.notFoundReferenceNumbers = [];

            if (!vm.referenceNumbers.errors.isBlank) {
                var numbers = vm.referenceNumbers.value.trim().split(/\r|\n/g);
                _.forEach(numbers, function(refNumber) {
                    if (refNumber.trim().length === 0) {
                        return;
                    }

                    var number = refNumber.trim().toLowerCase();

                    if (_.indexOf(vm.referenceNumbers.numbers, number ) === -1) {
                        vm.referenceNumbers.numbers.push(number);
                    }
                });

                vm.referenceNumbers.errors.hasToMany = vm.referenceNumbers.numbers.length > vm.referenceNumbers.max;
            }
        }
    }
})();


