var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var es = require('event-stream');
var fs = require("fs");
var path = require('path');
var bowerfiles = require('main-bower-files');
var print = require('gulp-print');
var rs = require('run-sequence').use(gulp);
var Q = require('q');
var argv = require('yargs').argv;

// == PATH STRINGS ========
var SOURCE = {
    LIB: './lib',
    ROOT: './app',
    MODULES: './app/components'
};
var DIST = {
    ROOT: './dist',
    DEV: './dist/dev',
    REL: './dist/rel'
};

//TODO: should we incrementally build to a BUILD folder, then DEPLOY from BUILD to Distribution folders????
///gulp tasks
gulp.task('clean', clean);
gulp.task('clean-lib-projects', cleanLibProjects);
gulp.task('import-lib-projects', importLibProjects);
gulp.task('deploy-assets', deployAssets);
gulp.task('deploy-vendor-javascript', deployVendorJavascript);
gulp.task('deploy-application', deployApplication);
gulp.task('deploy-modules', deployApplicationModules);
gulp.task('deploy-application-qa', deployApplicationQa);
gulp.task('deploy-modules-qa', deployApplicationModulesQa);
gulp.task('deploy-index', deployIndex);
gulp.task('deploy-web-config', deployIisWebConfig);
gulp.task('deploy', ['clean'], deploy);
gulp.task('deploy-qa', ['clean'], deployQa);
gulp.task('deploy-and-run', ['deploy'], runDev);
gulp.task('deploy-and-run-qa', ['deploy-qa'], runQA);
gulp.task('run', runDev);

//functions
function clean() {
    var deferred = Q.defer();
    del(DIST.ROOT, function () {
        deferred.resolve();
    });
    return deferred.promise;
}

function cleanLibProjects() {
    var deferred = Q.defer();
    del(SOURCE.LIB, function () {
        deferred.resolve();
    });
    return deferred.promise;
}

function importLibProjects() {
    return gulp.src(['../vis/dist/vis.js', '../vis/dist/vis.min.css', '../vis/dist/**/*.png'])
        .pipe(gulp.dest(SOURCE.LIB + '/vis'));
}

function deployAssets() {
    var bootstrap = gulp.src('./bower_components/bootstrap/dist/css/*min.css')
        .pipe(gulp.dest(DIST.DEV + '/css'))
        .pipe(gulp.dest(DIST.REL + '/css'));
    var fontawesomeCss = gulp.src('./bower_components/fontawesome/css/*min.css')
        .pipe(gulp.dest(DIST.DEV + '/css'))
        .pipe(gulp.dest(DIST.REL + '/css'));
    var visCss = gulp.src('./lib/vis/*min.css')
        .pipe(gulp.dest(DIST.DEV + '/css'))
        .pipe(gulp.dest(DIST.REL + '/css'));
    var metisMenu = gulp.src('./bower_components/metisMenu/dist/*min.css')
        .pipe(gulp.dest(DIST.DEV + '/css'));
    var jqueryCss = gulp.src('./bower_components/jquery-ui/themes/base/*.min.css')
        .pipe(gulp.dest(DIST.DEV + '/css'));
    var timepickerCss = gulp.src('./bower_components/jt.timepicker/*.css')
        .pipe(plugins.rename('jquery.timepicker.min.css'))
        .pipe(gulp.dest(DIST.DEV + '/css'));
    var css = gulp.src([SOURCE.ROOT + '/assets/css/*.css',SOURCE.MODULES + '/**/*.css'])
        .pipe(plugins.concat('styles.css'))
        .pipe(gulp.dest(DIST.DEV + '/css'))
        .pipe(gulp.dest(DIST.REL + '/css'));
    var printCss = gulp.src([SOURCE.ROOT + '/assets/css/print.css'])
        .pipe(gulp.dest(DIST.DEV + '/css'))
        .pipe(gulp.dest(DIST.REL + '/css'));
    var pdf = gulp.src([SOURCE.ROOT + '/assets/pdf/*.pdf'])
        .pipe(gulp.dest(DIST.DEV + '/pdf'))
        .pipe(gulp.dest(DIST.REL + '/pdf'));
    var visImages = gulp.src('./lib/vis/img/**/*.png', { base: './lib/vis/img'})
        .pipe(gulp.dest(DIST.DEV + '/img'))
        .pipe(gulp.dest(DIST.REL + '/img'));
    var images = gulp.src(SOURCE.ROOT + '/assets/images/*.*')
        .pipe(gulp.dest(DIST.DEV + '/img'))
        .pipe(gulp.dest(DIST.REL + '/img'));
    var loadingGif = gulp.src(SOURCE.ROOT + '/assets/images/loading.gif')
        .pipe(gulp.dest(DIST.DEV + '/images'))
        .pipe(gulp.dest(DIST.REL + '/images'));
    var jqueryImages = gulp.src('./bower_components/jquery-ui/themes/base/images/*.png')
        .pipe(gulp.dest(DIST.DEV + '/css/images'));
    var glyphs = gulp.src('./bower_components/bootstrap/dist/fonts/*')
        .pipe(plugins.rename({dirname: ''}))
        .pipe(gulp.dest(DIST.DEV + '/fonts'))
        .pipe(gulp.dest(DIST.REL + '/fonts'));
    var fonts = gulp.src('./bower_components/fontawesome/fonts/*')
        .pipe(plugins.rename({dirname: ''}))
        .pipe(gulp.dest(DIST.DEV + '/fonts'))
        .pipe(gulp.dest(DIST.REL + '/fonts'));
    var datetimePicker = gulp.src('./bower_components/eonasdan-bootstrap-datetimepicker/build/css/*min.css')
        .pipe(gulp.dest(DIST.DEV + '/css'))
        .pipe(gulp.dest(DIST.REL + '/css'));
    var jquerylightbox = gulp.src('./bower_components/lightbox2/dist/css/*min.css')
        .pipe(gulp.dest(DIST.DEV + '/css'))
        .pipe(gulp.dest(DIST.REL + '/css'));
    var jquerylightboximg = gulp.src('./bower_components/lightbox2/dist/images/*.png')
        .pipe(gulp.dest(DIST.DEV + '/images'))
        .pipe(gulp.dest(DIST.REL + '/images'));
    var jquerylightboxlic = gulp.src('./bower_components/lightbox2/LICENSE')
        .pipe(gulp.dest(DIST.DEV + '/css'))
        .pipe(gulp.dest(DIST.REL + '/css'));
    return es.merge(bootstrap, fontawesomeCss, visCss, metisMenu, css, printCss, jqueryCss, timepickerCss, visImages, images,loadingGif, jqueryImages, glyphs, fonts, datetimePicker,jquerylightbox,jquerylightboximg,jquerylightboxlic,pdf);
}
function deployVendorJavascript() {
    var vendor = gulp.src(bowerfiles('**/*.js'))
        .pipe(plugins.order(['jquery.js', 'angular.js']))
        .pipe(gulp.dest(DIST.DEV + '/js/vendor'))
        .pipe(plugins.concat('vendor.js'))
        .pipe(gulp.dest(DIST.REL + '/js'));

    var vis = gulp.src(SOURCE.LIB + '/vis/*.js', {base: SOURCE.LIB + '/vis'})
        .pipe(gulp.dest(DIST.DEV + '/js/vendor'));

    return es.merge(vendor, vis);
}
function deployModule(moduleName, fileName, dir) {
    
    var module = gulp.src(dir + '/*module.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var constants = gulp.src(dir + '/*constants.js')
        .pipe(plugins.replace('INSERT_SENTINEL_API_HOST_URL', "'" + argv.apiurl + "'"))
        .pipe(plugins.replace('INSERT_VISION_API_HOST_URL', "'" + argv.visionapiurl + "'"))
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var services = gulp.src(dir + '/*service.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var controllers = gulp.src(dir + '/*controller.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var directives = gulp.src(dir + '/*directive.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var converters = gulp.src(dir + '/*converter.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var filters = gulp.src(dir + '/*filter.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var routes = gulp.src(dir + '/*routes.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var runBlocks = gulp.src(dir + '/*run.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var datePickerLocales = gulp.src('./bower_components/jquery-ui/ui/minified/i18n/*.min.js')
        .pipe(plugins.concat('datepicker-locales.min.js'))
        .pipe(gulp.dest(DIST.DEV + '/js/vendor'));

    var jqueryTableExcel = gulp.src('./lib/jquery-table-exporter/*.js')
        .pipe(gulp.dest(DIST.DEV + '/js/vendor'));
    
    var angularScannerDetection = gulp.src('./lib/angular-scanner-detection/angular.scannerdetection.js')
        .pipe(gulp.dest(DIST.DEV + '/js/vendor'));

    var checkList = gulp.src('./bower_components/checklist-model/*.js')
        .pipe(gulp.dest(DIST.DEV + '/js/vendor'));
    
    var templates = gulp.src(dir + '/*.html')
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(plugins.angularTemplatecache({
            filename: 'app-templates.js',
            root: fileName,
            module: moduleName,
            standalone: false,
            templateHeader: '(function () {angular.module("<%= module %>"<%= standalone %>).run(["$templateCache", function($templateCache) {',
            templateFooter: '}]);})();'
        }));

    return es.merge(module, jqueryTableExcel, angularScannerDetection, datePickerLocales, constants, services, controllers, converters, directives, filters, routes, runBlocks, templates, checkList)
        .pipe(plugins.order(['*module.js', '*constants.js', '*service.js', '*converter.js', '*controller.js', '*directive.js', '*filter.js', '*routes.js', '*run.js']))
        .pipe(plugins.concat(fileName + '.js'))
        .pipe(gulp.dest(DIST.DEV + '/js/app'));
}

function deployModuleQa(moduleName, fileName, dir) {
    var fileNameCache = fileName+""+new Date().getTime();
    var module = gulp.src(dir + '/*module.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var constants = gulp.src(dir + '/*constants.js')
        .pipe(plugins.replace('INSERT_SENTINEL_API_HOST_URL', "'" + argv.apiurl + "'"))
        .pipe(plugins.replace('INSERT_VISION_API_HOST_URL', "'" + argv.visionapiurl + "'"))
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var services = gulp.src(dir + '/*service.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var controllers = gulp.src(dir + '/*controller.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var directives = gulp.src(dir + '/*directive.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var converters = gulp.src(dir + '/*converter.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var filters = gulp.src(dir + '/*filter.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var routes = gulp.src(dir + '/*routes.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var runBlocks = gulp.src(dir + '/*run.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var datePickerLocales = gulp.src('./bower_components/jquery-ui/ui/minified/i18n/*.min.js')
        .pipe(plugins.concat('datepicker-locales.min.js'))
        .pipe(gulp.dest(DIST.DEV + '/js/vendor'));

    var jqueryTableExcel = gulp.src('./lib/jquery-table-exporter/*.js')
        .pipe(gulp.dest(DIST.DEV + '/js/vendor'));

    var angularScannerDetection = gulp.src('./lib/angular-scanner-detection/angular.scannerdetection.js')
        .pipe(gulp.dest(DIST.DEV + '/js/vendor'));

    var checkList = gulp.src('./bower_components/checklist-model/*.js')
        .pipe(gulp.dest(DIST.DEV + '/js/vendor'));
    
    var templates = gulp.src(dir + '/*.html')
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(plugins.angularTemplatecache({
            filename: 'app-templates.js',
            root: fileName,
            module: moduleName,
            standalone: false,
            templateHeader: '(function () {angular.module("<%= module %>"<%= standalone %>).run(["$templateCache", function($templateCache) {',
            templateFooter: '}]);})();'
        }));
    return es.merge(module, jqueryTableExcel, angularScannerDetection, datePickerLocales, constants, services, controllers, converters, directives, filters, routes, runBlocks, templates, checkList)
        .pipe(plugins.order(['*module.js', '*constants.js', '*service.js', '*converter.js', '*controller.js', '*directive.js', '*filter.js', '*routes.js', '*run.js']))
        .pipe(plugins.concat(fileNameCache + '.js'))
        .pipe(gulp.dest(DIST.DEV + '/js/app'));
}

function deployApplication() {
    var dir = SOURCE.ROOT;
    var name = 'sentinel';
    var module = gulp.src(dir + '/*module.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var constants = gulp.src(dir + '/*constants.js')
        .pipe(plugins.replace('INSERT_SENTINEL_API_HOST_URL', argv.apiurl))
        .pipe(plugins.replace('INSERT_DEFAULT_TRACKING_URL', argv.trackingurl))
        .pipe(plugins.replace('GOOGLE-MAPS-API-KEY', argv.gmapkey))
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var services = gulp.src(dir + '/*service.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var controllers = gulp.src(dir + '/*controller.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var directives = gulp.src(dir + '/*directive.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var converters = gulp.src(dir + '/*converter.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var filters = gulp.src(dir + '/*filter.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var routes = gulp.src(dir + '/*routes.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var runBlocks = gulp.src(dir + '/*run.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var templates = gulp.src([dir + '/*.html', '!' + dir + '/index.html'])
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(plugins.angularTemplatecache({
            filename: 'app-templates.js',
            root: '',
            module: name,
            standalone: false,
            templateHeader: '(function () {angular.module("<%= module %>"<%= standalone %>).run(["$templateCache", function($templateCache) {',
            templateFooter: '}]);})();'
        }));

    return es.merge(module, constants, services, controllers, directives, converters, filters, routes, runBlocks, templates)
        .pipe(plugins.order(['*module.js', '*constants.js', '*converter.js','*service.js', '*controller.js', '*directive.js', '*filter.js', '*routes.js', '*run.js']))
        .pipe(plugins.concat(name + '.js'))
        .pipe(gulp.dest(DIST.DEV + '/js/app'));
}

function deployApplicationQa() {
    var dir = SOURCE.ROOT;
    var name = 'sentinel'+new Date().getTime();
    var module = gulp.src(dir + '/*module.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var constants = gulp.src(dir + '/*constants.js')
        .pipe(plugins.replace('INSERT_SENTINEL_API_HOST_URL', argv.apiurl))
        .pipe(plugins.replace('INSERT_DEFAULT_TRACKING_URL', argv.trackingurl))
        .pipe(plugins.replace('GOOGLE-MAPS-API-KEY', argv.gmapkey))
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var services = gulp.src(dir + '/*service.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var controllers = gulp.src(dir + '/*controller.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var directives = gulp.src(dir + '/*directive.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var converters = gulp.src(dir + '/*converter.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var filters = gulp.src(dir + '/*filter.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var routes = gulp.src(dir + '/*routes.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var runBlocks = gulp.src(dir + '/*run.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var templates = gulp.src([dir + '/*.html', '!' + dir + '/index.html'])
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(plugins.angularTemplatecache({
            filename: 'app-templates.js',
            root: '',
            module: name,
            standalone: false,
            templateHeader: '(function () {angular.module("<%= module %>"<%= standalone %>).run(["$templateCache", function($templateCache) {',
            templateFooter: '}]);})();'
        }));

    return es.merge(module, constants, services, controllers, directives, converters, filters, routes, runBlocks, templates)
        .pipe(plugins.order(['*module.js', '*constants.js', '*converter.js','*service.js', '*controller.js', '*directive.js', '*filter.js', '*routes.js', '*run.js']))
        .pipe(plugins.concat(name + '.js'))
        .pipe(gulp.dest(DIST.DEV + '/js/app'));
}
function deployApplicationModules() {
//TODO: dynamically search components director for any director that contains a *module.js file. Until then, need to explicitly add the modules to include
    return es.merge
        (
            deployModule('api-common-','api-common',SOURCE.MODULES + '/api-common'),
            deployModule('api-sentinel','api-sentinel',SOURCE.MODULES + '/api-sentinel'),
            deployModule('api-rls','api-rls',SOURCE.MODULES + '/api-rls'),
            deployModule('ui-common-','ui-common',SOURCE.MODULES + '/ui-common'),
            deployModule('ui-sentinel.home','ui-sentinel-home',SOURCE.MODULES + '/ui-sentinel/home'),
            deployModule('ui-sentinel.header','ui-sentinel-header',SOURCE.MODULES + '/ui-sentinel/header'),
            deployModule('ui-sentinel.login','ui-sentinel-login',SOURCE.MODULES + '/ui-sentinel/login'),
            deployModule('ui-sentinel.session','ui-sentinel-session',SOURCE.MODULES + '/ui-sentinel/session'),
            deployModule('ui-sentinel.accounts','ui-sentinel-accounts',SOURCE.MODULES + '/ui-sentinel/accounts'),
            deployModule('ui-sentinel.logins','ui-sentinel-logins',SOURCE.MODULES + '/ui-sentinel/logins'),
            deployModule('ui-sentinel.sentry','ui-sentinel-sentry',SOURCE.MODULES + '/ui-sentinel/sentry'),
            deployModule('ui-sentinel.sentinel','ui-sentinel-sentinel',SOURCE.MODULES + '/ui-sentinel/sentinel'),
            deployModule('ui-sentinel.sentry-reports','ui-sentinel-sentry-reports',SOURCE.MODULES + '/ui-sentinel/sentry-reports'),
            deployModule('ui-sentinel.sentry-configs','ui-sentinel-sentry-configs',SOURCE.MODULES + '/ui-sentinel/sentry-configs'),
            deployModule('ui-sentinel.sentry-commands','ui-sentinel-sentry-commands',SOURCE.MODULES + '/ui-sentinel/sentry-commands'),
            deployModule('ui-sentinel.sightings','ui-sentinel-sightings',SOURCE.MODULES + '/ui-sentinel/sightings'),
            deployModule('ui-sentinel.simulators','ui-sentinel-simulators',SOURCE.MODULES + '/ui-sentinel/simulators'),
            deployModule('ui-sentinel.feedback','ui-sentinel-feedback',SOURCE.MODULES + '/ui-sentinel/feedback'),
            deployModule('ui-sentinel.maps','ui-sentinel-maps',SOURCE.MODULES + '/ui-sentinel/maps'),
            deployModule('ui-sentinel.devicegroups','ui-sentinel-devicegroups',SOURCE.MODULES + '/ui-sentinel/devicegroups'),
            deployModule('ui-sentinel.alarms','ui-sentinel-alarms',SOURCE.MODULES + '/ui-sentinel/alarms'),
            deployModule('ui-sentinel.geofences','ui-sentinel-geofences',SOURCE.MODULES + '/ui-sentinel/geofences'),
            deployModule('ui-sentinel.shipments','ui-sentinel-shipments',SOURCE.MODULES + '/ui-sentinel/shipments'),
            deployModule('ui-sentinel.shipments.shipmentsList','ui-sentinel-shipments.shipmentsList',SOURCE.MODULES + '/ui-sentinel/shipments/shipments-list'),
            deployModule('ui-sentinel.shipments.shipmentAdmin','ui-sentinel-shipments.shipmentAdmin',SOURCE.MODULES + '/ui-sentinel/shipments/shipment-admin'),
            deployModule('ui-sentinel.shipments.shipmentNew','ui-sentinel-shipments.shipmentNew',SOURCE.MODULES + '/ui-sentinel/shipments/shipment-new'),
            deployModule('ui-sentinel.shipments.shipmentStopRow','ui-sentinel-shipments.shipmentStopRow',SOURCE.MODULES + '/ui-sentinel/shipments/shipment-stop-row'),
            deployModule('ui-sentinel.shipments.templatesAdmin','ui-sentinel-shipments.templatesAdmin',SOURCE.MODULES + '/ui-sentinel/shipments/templates-admin'),
            deployModule('ui-sentinel.shipments.shipmentReportToolItem','ui-sentinel-shipments.shipmentReportToolItem',SOURCE.MODULES + '/ui-sentinel/shipments/shipment-report-tool-item'),
            deployModule('ui-sentinel.shipments.shipmentTracking','ui-sentinel-shipments.shipmentTracking',SOURCE.MODULES + '/ui-sentinel/shipments/shipment-tracking'),
            deployModule('ui-sentinel.shipments.latestShipmentTracking','ui-sentinel-shipments.latestShipmentTracking',SOURCE.MODULES + '/ui-sentinel/shipments/latest-shipment-tracking'),
            deployModule('ui-sentinel.shipments.notificationsAdmin','ui-sentinel-shipments.notificationsAdmin',SOURCE.MODULES + '/ui-sentinel/shipments/notifications-admin'),
            deployModule('ui-sentinel.watchlist','ui-sentinel-watchlist',SOURCE.MODULES + '/ui-sentinel/watchlist'),
            deployModule('ui-sentinel.devices','ui-sentinel-devices',SOURCE.MODULES + '/ui-sentinel/devices'),
            deployModule('ui-sentinel.devices.deviceReportToolItem','ui-sentinel-devices.deviceReportToolItem',SOURCE.MODULES + '/ui-sentinel/devices/device-report-tool-item'),
            deployModule('ui-sentinel.devices.deviceTracking','ui-sentinel-devices.deviceTracking',SOURCE.MODULES + '/ui-sentinel/devices/device-tracking'),
            deployModule('ui-sentinel.devices.sentinelTracking','ui-sentinel-devices.sentinelTracking',SOURCE.MODULES + '/ui-sentinel/devices/sentinel-tracking'),
            deployModule('ui-sentinel.devices.latestDeviceTracking','ui-sentinel-devices.latestDeviceTracking',SOURCE.MODULES + '/ui-sentinel/devices/latest-device-tracking'),
            deployModule('ui-sentinel.devices.devicePivot','ui-sentinel-devices.devicePivot',SOURCE.MODULES + '/ui-sentinel/devices/device-pivot'),
            deployModule('ui-sentinel.locations','ui-sentinel-locations',SOURCE.MODULES + '/ui-sentinel/locations'),
            deployModule('ui-sentinel.zones','ui-sentinel-zones',SOURCE.MODULES + '/ui-sentinel/zones'),
            deployModule('ui-sentinel.assets','ui-sentinel-assets',SOURCE.MODULES + '/ui-sentinel/assets'),
            deployModule('ui-sentinel.calibrations','ui-sentinel-calibrations',SOURCE.MODULES + '/ui-sentinel/calibrations'),
            deployModule('ui-sentinel.calibrations.calibrationControlCenter','ui-sentinel-calibrations.calibrationControlCenter',SOURCE.MODULES + '/ui-sentinel/calibrations/calibration-control-center'),
            deployModule('ui-sentinel.fulfillment','ui-sentinel-fulfillment',SOURCE.MODULES + '/ui-sentinel/fulfillment'),

            deployModule('ui-rls.login','ui-rls-login',SOURCE.MODULES + '/ui-rls/login'),
            deployModule('ui-rls.home','ui-rls-home',SOURCE.MODULES + '/ui-rls/home'),
            deployModule('ui-rls.header','ui-rls-header',SOURCE.MODULES + '/ui-rls/header'),
            deployModule('ui-rls.session','ui-rls-session',SOURCE.MODULES + '/ui-rls/session'),
            deployModule('ui-rls.branches','ui-rls-branches',SOURCE.MODULES + '/ui-rls/branches'),
            deployModule('ui-rls.recovery','ui-rls-recovery',SOURCE.MODULES + '/ui-rls/recovery'),
            deployModule('ui-rls.exceptions','ui-rls-exceptions',SOURCE.MODULES + '/ui-rls/exceptions'),

            // deployModule('ui-sentinel.sentry','ui-sentinel-sentry',SOURCE.MODULES + '/ui-sentinel/sentry'),
            //deployModule('ui-sentinel.sightings','ui-sentinel-sightings',SOURCE.MODULES + '/ui-sentinel/sightings'),
            //deployModule('ui-sentinel.emulator','ui-sentinel-emulator',SOURCE.MODULES + '/ui-sentinel/emulator')
            // deployModule('ui-sentinel.exception','ui-sentinel-exception',SOURCE.MODULES + '/ui-sentinel/exception')
        )
        .pipe(plugins.concat('app-modules.js'))
        .pipe(gulp.dest(DIST.REL + '/js'));
}

function deployApplicationModulesQa() {
//TODO: dynamically search components director for any director that contains a *module.js file. Until then, need to explicitly add the modules to include
    return es.merge
        (
            deployModuleQa('api-common-','api-common',SOURCE.MODULES + '/api-common'),
            deployModuleQa('api-sentinel','api-sentinel',SOURCE.MODULES + '/api-sentinel'),
            deployModuleQa('api-rls','api-rls',SOURCE.MODULES + '/api-rls'),
            deployModuleQa('ui-common-','ui-common',SOURCE.MODULES + '/ui-common'),
            deployModuleQa('ui-sentinel.home','ui-sentinel-home',SOURCE.MODULES + '/ui-sentinel/home'),
            deployModuleQa('ui-sentinel.header','ui-sentinel-header',SOURCE.MODULES + '/ui-sentinel/header'),
            deployModuleQa('ui-sentinel.login','ui-sentinel-login',SOURCE.MODULES + '/ui-sentinel/login'),
            deployModuleQa('ui-sentinel.session','ui-sentinel-session',SOURCE.MODULES + '/ui-sentinel/session'),
            deployModuleQa('ui-sentinel.accounts','ui-sentinel-accounts',SOURCE.MODULES + '/ui-sentinel/accounts'),
            deployModuleQa('ui-sentinel.logins','ui-sentinel-logins',SOURCE.MODULES + '/ui-sentinel/logins'),
            deployModuleQa('ui-sentinel.sentry','ui-sentinel-sentry',SOURCE.MODULES + '/ui-sentinel/sentry'),
            deployModuleQa('ui-sentinel.sentinel','ui-sentinel-sentinel',SOURCE.MODULES + '/ui-sentinel/sentinel'),
            deployModuleQa('ui-sentinel.sentry-reports','ui-sentinel-sentry-reports',SOURCE.MODULES + '/ui-sentinel/sentry-reports'),
            deployModuleQa('ui-sentinel.sentry-configs','ui-sentinel-sentry-configs',SOURCE.MODULES + '/ui-sentinel/sentry-configs'),
            deployModuleQa('ui-sentinel.sentry-commands','ui-sentinel-sentry-commands',SOURCE.MODULES + '/ui-sentinel/sentry-commands'),
            deployModuleQa('ui-sentinel.sightings','ui-sentinel-sightings',SOURCE.MODULES + '/ui-sentinel/sightings'),
            deployModuleQa('ui-sentinel.simulators','ui-sentinel-simulators',SOURCE.MODULES + '/ui-sentinel/simulators'),
            deployModuleQa('ui-sentinel.feedback','ui-sentinel-feedback',SOURCE.MODULES + '/ui-sentinel/feedback'),
            deployModuleQa('ui-sentinel.maps','ui-sentinel-maps',SOURCE.MODULES + '/ui-sentinel/maps'),
            deployModuleQa('ui-sentinel.devicegroups','ui-sentinel-devicegroups',SOURCE.MODULES + '/ui-sentinel/devicegroups'),
            deployModuleQa('ui-sentinel.alarms','ui-sentinel-alarms',SOURCE.MODULES + '/ui-sentinel/alarms'),
            deployModuleQa('ui-sentinel.geofences','ui-sentinel-geofences',SOURCE.MODULES + '/ui-sentinel/geofences'),
            deployModuleQa('ui-sentinel.shipments','ui-sentinel-shipments',SOURCE.MODULES + '/ui-sentinel/shipments'),
            deployModuleQa('ui-sentinel.shipments.shipmentsList','ui-sentinel-shipments.shipmentsList',SOURCE.MODULES + '/ui-sentinel/shipments/shipments-list'),
            deployModuleQa('ui-sentinel.shipments.shipmentAdmin','ui-sentinel-shipments.shipmentAdmin',SOURCE.MODULES + '/ui-sentinel/shipments/shipment-admin'),
            deployModuleQa('ui-sentinel.shipments.shipmentNew','ui-sentinel-shipments.shipmentNew',SOURCE.MODULES + '/ui-sentinel/shipments/shipment-new'),
            deployModuleQa('ui-sentinel.shipments.shipmentStopRow','ui-sentinel-shipments.shipmentStopRow',SOURCE.MODULES + '/ui-sentinel/shipments/shipment-stop-row'),
            deployModuleQa('ui-sentinel.shipments.templatesAdmin','ui-sentinel-shipments.templatesAdmin',SOURCE.MODULES + '/ui-sentinel/shipments/templates-admin'),
            deployModuleQa('ui-sentinel.shipments.shipmentReportToolItem','ui-sentinel-shipments.shipmentReportToolItem',SOURCE.MODULES + '/ui-sentinel/shipments/shipment-report-tool-item'),
            deployModuleQa('ui-sentinel.shipments.shipmentTracking','ui-sentinel-shipments.shipmentTracking',SOURCE.MODULES + '/ui-sentinel/shipments/shipment-tracking'),
            deployModuleQa('ui-sentinel.shipments.latestShipmentTracking','ui-sentinel-shipments.latestShipmentTracking',SOURCE.MODULES + '/ui-sentinel/shipments/latest-shipment-tracking'),
            deployModuleQa('ui-sentinel.shipments.notificationsAdmin','ui-sentinel-shipments.notificationsAdmin',SOURCE.MODULES + '/ui-sentinel/shipments/notifications-admin'),
            deployModuleQa('ui-sentinel.watchlist','ui-sentinel-watchlist',SOURCE.MODULES + '/ui-sentinel/watchlist'),
            deployModuleQa('ui-sentinel.devices','ui-sentinel-devices',SOURCE.MODULES + '/ui-sentinel/devices'),
            deployModuleQa('ui-sentinel.devices.deviceReportToolItem','ui-sentinel-devices.deviceReportToolItem',SOURCE.MODULES + '/ui-sentinel/devices/device-report-tool-item'),
            deployModuleQa('ui-sentinel.devices.deviceTracking','ui-sentinel-devices.deviceTracking',SOURCE.MODULES + '/ui-sentinel/devices/device-tracking'),
            deployModuleQa('ui-sentinel.devices.sentinelTracking','ui-sentinel-devices.sentinelTracking',SOURCE.MODULES + '/ui-sentinel/devices/sentinel-tracking'),
            deployModuleQa('ui-sentinel.devices.latestDeviceTracking','ui-sentinel-devices.latestDeviceTracking',SOURCE.MODULES + '/ui-sentinel/devices/latest-device-tracking'),
            deployModuleQa('ui-sentinel.devices.devicePivot','ui-sentinel-devices.devicePivot',SOURCE.MODULES + '/ui-sentinel/devices/device-pivot'),
            deployModuleQa('ui-sentinel.locations','ui-sentinel-locations',SOURCE.MODULES + '/ui-sentinel/locations'),
            deployModuleQa('ui-sentinel.zones','ui-sentinel-zones',SOURCE.MODULES + '/ui-sentinel/zones'),
            deployModuleQa('ui-sentinel.assets','ui-sentinel-assets',SOURCE.MODULES + '/ui-sentinel/assets'),
            deployModuleQa('ui-sentinel.calibrations','ui-sentinel-calibrations',SOURCE.MODULES + '/ui-sentinel/calibrations'),
            deployModuleQa('ui-sentinel.calibrations.calibrationControlCenter','ui-sentinel-calibrations.calibrationControlCenter',SOURCE.MODULES + '/ui-sentinel/calibrations/calibration-control-center'),
            deployModuleQa('ui-sentinel.fulfillment','ui-sentinel-fulfillment',SOURCE.MODULES + '/ui-sentinel/fulfillment'),
            deployModuleQa('ui-rls.login','ui-rls-login',SOURCE.MODULES + '/ui-rls/login'),
            deployModuleQa('ui-rls.home','ui-rls-home',SOURCE.MODULES + '/ui-rls/home'),
            deployModuleQa('ui-rls.header','ui-rls-header',SOURCE.MODULES + '/ui-rls/header'),
            deployModuleQa('ui-rls.session','ui-rls-session',SOURCE.MODULES + '/ui-rls/session'),
            deployModuleQa('ui-rls.branches','ui-rls-branches',SOURCE.MODULES + '/ui-rls/branches'),
            deployModuleQa('ui-rls.recovery','ui-rls-recovery',SOURCE.MODULES + '/ui-rls/recovery'),
            deployModuleQa('ui-rls.exceptions','ui-rls-exceptions',SOURCE.MODULES + '/ui-rls/exceptions')

            // deployModuleQa('ui-sentinel.sentry','ui-sentinel-sentry',SOURCE.MODULES + '/ui-sentinel/sentry'),
            //deployModuleQa('ui-sentinel.sightings','ui-sentinel-sightings',SOURCE.MODULES + '/ui-sentinel/sightings'),
            //deployModuleQa('ui-sentinel.emulator','ui-sentinel-emulator',SOURCE.MODULES + '/ui-sentinel/emulator')
            // deployModuleQa('ui-sentinel.exception','ui-sentinel-exception',SOURCE.MODULES + '/ui-sentinel/exception')
        )
        .pipe(plugins.concat('app-modules.js'))
        .pipe(gulp.dest(DIST.REL + '/js'));
}

function deployIisWebConfig() {
    if (argv.nowebconfig) {
        return null;
    }
    return gulp.src(SOURCE.ROOT + '/web.config')
        .pipe(gulp.dest(DIST.DEV));
}

function deployIndex() {
    //TODO: need to finish release deployment of index
    var css = gulp.src(DIST.DEV + '/css/*.css', { read: false }).pipe(plugins.order([
                'bootstrap.*.css',
                'bootstrap-theme.*.css',
                'font*.css',
                'metis*.css',
                'vis*.css',
                'styles.css',
                'theme.css'
            ]));
    var vendorJs = gulp.src(DIST.DEV + '/js/vendor/*.js', { read: false })
        .pipe(plugins.order([
            'jquery.js',
            'jquery*.js',
            'bootstrap.js',
            'angular.js',
            'angular*.js',
            'moment.js',
        ]));
    var js = gulp.src(DIST.DEV + '/js/app/*.js', { read: false })
        .pipe(plugins.order([
            'ui-sentinel.js',
            'api-sentinel.js'
        ]));
    var index = gulp.src(SOURCE.ROOT + '/index.html')
        .pipe(plugins.replace('GOOGLE-MAPS-API-KEY', argv.gmapkey))
        .pipe(gulp.dest(DIST.DEV))
        .pipe(plugins.inject(css, {relative: true }))
        .pipe(plugins.inject(vendorJs, {relative: true, name: 'bower' }))
        .pipe(plugins.inject(js, {relative: true }))
        .pipe(gulp.dest(DIST.DEV));
    return index;
}
function deploy() {
    var deferred = Q.defer();
    rs(['deploy-assets', 'deploy-vendor-javascript', 'deploy-application', 'deploy-modules'],'deploy-index', 'deploy-web-config', function() {
        deferred.resolve();
    });
    return deferred.promise;
}

function deployQa() {
    var deferred = Q.defer();
    rs(['deploy-assets', 'deploy-vendor-javascript', 'deploy-application-qa', 'deploy-modules-qa'],'deploy-index', 'deploy-web-config', function() {
        deferred.resolve();
    });
    return deferred.promise;
}

function runDev() {
    plugins.nodemon({script: 'server.js', ext: 'js', watch: [], env: {NODE_ENV: 'development'}})
        //.on('change', ['validate-devserver-scripts'])
        .on('restart', function () {
            console.log('[nodemon] restarted dev server');
        });

    plugins.livereload.listen({ start: true });

    //setup watches
    gulp.watch(SOURCE.ROOT + '/index.html', function() {
       return deployIndex()
           .pipe(plugins.livereload());
    });

    gulp.watch([SOURCE.ROOT + '/assets/css/*.css',SOURCE.MODULES + '/**/*.css'], function() {
        return deployAssets()
            .pipe(plugins.livereload());
    });

    gulp.watch(SOURCE.ROOT + '/*.js', function () {
        return deployApplication()
            .pipe(plugins.livereload());
    });

    gulp.watch([SOURCE.MODULES + '/**/*.js', SOURCE.MODULES + '/**/*.html'], function () {
       return deployApplicationModules()
           .pipe(plugins.livereload());
    });
}


function runQA() {
    plugins.nodemon({script: 'server.js', ext: 'js', watch: [], env: {NODE_ENV: 'development'}})
        //.on('change', ['validate-devserver-scripts'])
        .on('restart', function () {
            console.log('[nodemon] restarted dev server');
        });

    plugins.livereload.listen({ start: true });

    //setup watches
    gulp.watch(SOURCE.ROOT + '/index.html', function() {
       return deployIndex()
           .pipe(plugins.livereload());
    });

    gulp.watch([SOURCE.ROOT + '/assets/css/*.css',SOURCE.MODULES + '/**/*.css'], function() {
        return deployAssets()
            .pipe(plugins.livereload());
    });
    
    gulp.watch(SOURCE.ROOT + '/*.js', function () {
        return deployApplicationQa()
            .pipe(plugins.livereload());
    });

    gulp.watch([SOURCE.MODULES + '/**/*.js', SOURCE.MODULES + '/**/*.html'], function () {
       return deployApplicationModulesQa()
           .pipe(plugins.livereload());
    });
}

