(function () {
    'use strict';

    angular
        .module('ui-sentinel.maps')
        .constant('MapsConstants', {
            mapTypes: {
                hybrid: {
                    name: 'Hybrid',
                    type: google.maps.MapTypeId.HYBRID
                },
                roadmap: {
                    name: 'Roadmap',
                    type: google.maps.MapTypeId.ROADMAP
                },
                satellite: {
                    name: 'Satellite',
                    type: google.maps.MapTypeId.SATELLITE
                },
                terrain: {
                    name: 'Terrain',
                    type: google.maps.MapTypeId.TERRAIN
                }
            },
            zooms: {
                world: {
                    center: { lat: 19.0, lng: 20.45},
                    zoomLevel: 2
                },
                northAmerica: {
                    center: { lat: 34.8, lng: -98.48},
                    zoomLevel: 4
                },
                southAmerica: {
                    center: { lat: -20.245, lng: -62.935},
                    zoomLevel: 3
                },
                europe: {
                    center: { lat: 48.069, lng: 12.283},
                    zoomLevel: 4
                },
                middleEast: {
                    center: { lat: 29.6, lng: 67.2},
                    zoomLevel: 4
                },
                farEast: {
                    center: { lat: 29.2, lng: 119.444},
                    zoomLevel: 4
                },
                southPacific: {
                    center: { lat: -14.413, lng: 125.186},
                    zoomLevel: 3
                },
                geofenceDefault: {
                    center: { lat: 19, lng: 20.45},
                    zoomLevel: 2
                }
            },
            icons: {
                deviceReports: {
                    normal: {
                        selected: {
                            url: '../img/halo.png',
                            anchor: new google.maps.Point(32,48)
                        },
                        hover: {
                            url: '../img/check-0.png'
                        },
                        default: {
                            url: '../img/check-1-a.png'
                        }
                    },
                    info: {
                        selected: {
                            url: '../img/halo.png',
                            anchor: new google.maps.Point(32,48)
                        },
                        hover: {
                            scaledSize: {height: 30, width: 30 },
                            url: '../img/info-circle.png'

                        },
                        default: {
                            scaledSize: {height: 20, width: 20 },
                            url: '../img/info-circle.png'
                        }
                    },
                    alarm: {
                        selected: {
                            url: '../img/halo.png',
                            anchor: new google.maps.Point(32, 48)
                        },
                        hover: {
                            url: '../img/exclamation-circle.png'

                        },
                        default: {
                            url: '../img/exclamation-circle.png'
                        }
                    }
                },
                shipmentReports: {

                },
                trackingLocation: {
                    pin: {
                        selected: {
                            url: "https://mt.google.com/vt/icon?font=fonts/Roboto-Regular.ttf&color=ff330000&name=icons/spotlight/spotlight-waypoint-a.png&scale=1"
                        },
                        default: {
                            url: "https://mt.google.com/vt/icon?font=fonts/Roboto-Regular.ttf&color=ff330000&name=icons/spotlight/spotlight-waypoint-b.png&scale=1"
                        }
                    },
                    anchor:{
                        selected: {
                            url: "../img/ok-anchor-selected.png",
                            anchor: {x: 11, y: 11},
                            scaledSize: { height: 24, width: 24}
                        },
                        default: {
                            url: "../img/ok-anchor.png",
                            anchor: {x: 11, y: 11},
                            scaledSize: { height: 24, width: 24}
                        }
                    }
                },
                geofences: {
                    radial: {
                        scaledSize: {height: 30, width: 30 },
                        url: 'http://maps.google.com/mapfiles/kml/paddle/ltblu-circle.png'
                    },
                    polygon: {
                        scaledSize: {height: 30, width: 30},
                        url: 'http://maps.google.com/mapfiles/kml/paddle/blu-circle.png'
                    },
                    selected: {
                        scaledSize: {height: 30, width: 30},
                        url: 'http://maps.google.com/mapfiles/kml/paddle/orange-circle.png'
                    },
                    hover: {
                        scaledSize: {height: 30, width: 30},
                        url: 'http://maps.google.com/mapfiles/kml/paddle/ylw-circle.png'
                    }
                },
                stops: {
                    default: {
                        scaledSize: {height: 40, width: 40 },
                        url: 'http://maps.google.com/mapfiles/kml/pal2/icon13.png'
                    },
                    arrived: {
                        scaledSize: {height: 40, width: 40 },
                        url: 'http://maps.google.com/mapfiles/kml/pal2/icon5.png'
                    }
                }
            },
            shapes: {
                selected: {
                    strokeColor: '#FFA500',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#FFA500',
                    fillOpacity: 0.25
                },
                hover: {
                    strokeColor: '#FFFF00',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#FFFF00',
                    fillOpacity: 0.25
                },
                radial: {
                    strokeColor: '#00FFFF',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00FFFF',
                    fillOpacity: 0.25
                },
                polygon: {
                    strokeColor: '#0000FF',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#0000FF',
                    fillOpacity: 0.25
                },
                shipmentStop: {
                    strokeColor: '#FFFF00',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#FFFF00',
                    fillOpacity: 0.25
                },
                inGeofence: {
                    strokeColor: '#00FFFF',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00FFFF',
                    fillOpacity: 0.25
                },
                notInGeofence: {
                    strokeColor: '#00FFFF',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00FFFF',
                    fillOpacity: 0.25
                }

            }
        });

})();