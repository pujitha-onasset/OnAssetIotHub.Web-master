(function () {
    'use strict';

    angular
        .module('ui-sentinel.sightings')
        .config(routes);

    routes.$inject = ['$stateProvider'];
    function routes($stateProvider) {
        $stateProvider
            .state('sightings', {
                abstract: true,
                url: '/sightings',
                template: '<ui-view/>',
                data: {
                    authorizationRequired: true,
                    pageTitle: 'Sightings',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('sightings.latest', {
                url: '/latest',
                templateUrl: 'ui-sentinel-sightings/latest-sightings-list.html'
            })
            .state('sightings.for-report', {
                url: '/reports/{reportId}',
                templateUrl: 'ui-sentinel-sightings/sightings-for-report.html',
                params: {
                    report: null,
                    reportsList: null,
                    from: null,
                    to:null
                },
                data: {
                    subTitle: 'For Report'
                }
            })
            .state('sightings.by-device', {
                url: '/sentries/{imei}',
                templateUrl: 'ui-sentinel-sightings/sightings-by-device.html',
                params: {
                    from: null,
                    to: null
                },
                data: {
                    subTitle: 'By Device'
                }
            })
            .state('sightings.of-mac', {
                url: '/sentinels/{mac}',
                templateUrl: 'ui-sentinel-sightings/sightings-of-mac.html',
                params: {
                    from: null,
                    to: null
                },
                data: {
                    subTitle: 'Of Sentinel'
                }
            })
            .state('sightings.pivot', {
                url: '/sentries/{imei}/pivot',
                templateUrl: 'ui-sentinel-sightings/sightings-pivot.html',
                params: {
                    lastReport: null,
                    firstReport: null
                },
                data: {
                    subTitle: 'Pivot'
                }
            })
        ;
    }

})();