(function() {
    'use strict';

    angular
        .module('tracking.ui.theme')
        .directive('navigation', NavigationDirective);

    NavigationDirective.$inject = [];
    function NavigationDirective() {
        var directive = {
            restrict: 'A',
            templateUrl: 'tracking-ui-theme/theme-navigation-directive.html',
            controller: ThisController,
            controllerAs: 'nav'
        };
        return directive;
    }
    
    ThisController.$inject = ['$rootScope', '$state', '$stateParams', 'localStorageService'];
    function ThisController($rootScope, $state, $stateParams, localStorageService) {
        var vm = {
            showMenu: false,
            showShipmentMenuLink: false,
            onShipmentsPage: false,
            onShipmentPage: false,
            shipment: null,
            pageTitle: '',
            subTitle: null,
            toggleMenu: function() {
                this.showMenu = !this.showMenu;
                $('#btn-toggle-menu').blur();
            },
            go: go
        };
        activate();
        return vm;

        //////////////////////////////

        function activate() {
            $rootScope.$on('$stateChangeSuccess', function (event, args) {
                vm.showMenu = false;

                if ($state.current.name === 'shipments.map') {
                    //enable this option since the app directed us here
                    vm.showShipmentMenuLink = true;
                }

                if ($state.current.name === 'home') {
                    //disable this option since the app directed us here
                    vm.showShipmentMenuLink = false;
                }
            });
        }

        function go(state) {
            vm.showMenu = false;
            $state.go(state);
        }

    }
})();