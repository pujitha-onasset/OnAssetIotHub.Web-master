(function () {
    'use strict';

    angular
        .module('ui-sentinel.maps')
        .factory('MapAndTimelineService', MapAndTimelineService);

    MapAndTimelineService.$inject = [];
    function MapAndTimelineService () {
        var service = {
            onIdle: onIdle,
            onReportsChange: onReportsChange,
            onSelectedReportChange: onSelectedReportChange,
            onFilterChange: onFilterChange,
            onReportMarkerClick: onReportMarkerClick,
            onReportMouseOver: onReportMouseOver,
            onReportMouseOut: onReportMouseOut,
            onMapBoundsChange: onMapBoundsChange,
            onTimelineRangeChange: onTimelineRangeChange,
            clearMarkers: clearMarkers,
            closeMapTool: closeMapTool,
            getReportMarker: getReportMarker,
            panMapToReport: panMapToReport,
            setMapType: setMapType,
            setZoom: setZoom,
            showMapData: showMapData,
            fitTimeline: fitTimeline,
            moveTimelineToCurrentDay: moveTimelineToCurrentDay,
            moveTimelineToCurrentWeek: moveTimelineToCurrentWeek,
            moveTimelineToCurrentMonth: moveTimelineToCurrentMonth,
            moveTimelineToCurrentYear: moveTimelineToCurrentYear,
            moveTimelineToReport: moveTimelineToReport,
            syncDateRange: syncDateRange
        };
        return service;

        function fitTimeline(timeline) {
            if (timeline) {
                timeline.fit();
            }
        }
        
        function moveTimelineToReport(timeline, report) {
            if (timeline && report) {
                timeline.moveTo(report.messageTimestamp);
            }
        }

        function moveTimelineToCurrentYear(timeline) {
            if (timeline) {
                timeline.setWindow(moment().subtract(1, 'year').startOf('month'), moment().endOf('month'));
            }
        }

        function moveTimelineToCurrentDay(timeline) {
            if (timeline) {
                timeline.setWindow(moment().startOf('day'), moment().endOf('day'));
            }
        }

        function moveTimelineToCurrentWeek(timeline) {
            if (timeline) {
                timeline.setWindow(moment().subtract(7, 'day').startOf('day'), moment().endOf('day'));
            }
        }

        function moveTimelineToCurrentMonth(timeline) {
            if (timeline) {
                timeline.setWindow(moment().subtract(1, 'month').startOf('day'), moment().endOf('day'));
            }
        }

        function onReportsChange() {
            //requires dataservice, filterservice(?)
            //timeline
                //rangeChanged event handler: requires timeline, filterService, rangeChange function
                //remove old items: requires timeline dataset
                //add new items
            //map
                //remove markers: requires markers
                //add new markers: requires map
                    //set icons
                    //set listeners
        }

        function onSelectedReportChange() {
            //timeline
                //remove currently selected item from dataset: requires old report id
                //add new selected item to dataset: required data set with knowledge of selected groupId
                //returns new item?

            //map
                //set map to null for current selected marker: requires current marker
                //add new selected marker: requires map
                //returns new marker
        }
    }
})();