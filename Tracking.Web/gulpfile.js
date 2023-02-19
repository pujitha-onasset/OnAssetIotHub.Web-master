var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var es = require('event-stream');
var fs = require('fs');
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
    MODULES: './app/components',
    UI: './app/components/ui',
    API: './app/components/api',
    THEME: './app/components/ui-theme/' + argv.theme
};
var DIST = {
    DEV: './dist.dev.' + argv.theme,
    REL: './dist.rel.' + argv.theme
};

///gulp tasks
gulp.task('clean', clean);
gulp.task('clean-release', cleanRelease);
gulp.task('clean-lib-projects', cleanLibProjects);
gulp.task('import-lib-projects', importLibProjects);
gulp.task('deploy-assets', deployAssets);
gulp.task('deploy-vendor-javascript', deployVendorJavascript);
gulp.task('deploy-application', deployApplication);
gulp.task('deploy-modules', deployApplicationModules);
gulp.task('deploy-index', deployIndex);
gulp.task('deploy-web-config', deployIisWebConfig);
gulp.task('update-lib-deploy', ['clean'], updateLibAndDeploy);
gulp.task('deploy', ['clean'], deploy);
gulp.task('deploy-and-run', ['deploy'], runDev);
gulp.task('release-and-run', ['release'], runRelease);
gulp.task('release-assets', releaseAssets);
gulp.task('release-index', releaseIndex);
gulp.task('release-minify-css', releaseMinifyCss);
gulp.task('release-web-config', releaseIisWebConfig);
gulp.task('release', ['deploy', 'clean-release'], releaseApp);
gulp.task('run', runDev);

//functions
function clean() {
    var deferred = Q.defer();
    del(DIST.DEV, function () {
        deferred.resolve();
    });
    return deferred.promise;
}

function cleanRelease() {
    var deferred = Q.defer();
    del(DIST.REL, function () {
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

function deploy() {
    var deferred = Q.defer();
    rs(['deploy-assets', 'deploy-vendor-javascript', 'deploy-application', 'deploy-modules'],'deploy-index', 'deploy-web-config', function() {
        deferred.resolve();
    });
    return deferred.promise;
}

function deployApplication() {
    var dir = SOURCE.ROOT;
    var name = 'app';
    var module = gulp.src(dir + '/*module.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var constants = gulp.src(dir + '/*constants.js')
        .pipe(plugins.replace('INSERT_API_HOST_URL', argv.apiurl))
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

    return es.merge(module, constants, services, controllers, directives, filters, routes, runBlocks, templates)
        .pipe(plugins.order(['*module.js', '*constants.js', '*service.js', '*controller.js', '*directive.js', '*filter.js', '*routes.js', '*run.js']))
        .pipe(plugins.concat(name + '.js'))
        .pipe(gulp.dest(DIST.DEV + '/js/app'));
}

function deployApplicationModules() {
    return es.merge
    (
        deployModule('tracking.api.host','tracking-api-host',SOURCE.API + '/host'),
        deployModule('tracking.api.tracking','tracking-api-tracking',SOURCE.API + '/tracking'),
        deployModule('tracking.ui.common','tracking-ui-common',SOURCE.UI + '/common'),
        deployModule('tracking.ui.feedback','tracking-ui-feedback',SOURCE.UI + '/feedback'),
        deployModule('tracking.ui.shipments','tracking-ui-shipments',SOURCE.UI + '/shipments'),
        deployModule('tracking.ui.shipments.filterbar','tracking-ui-shipments-filterbar',SOURCE.UI + '/shipments/filterbar'),
        deployModule('tracking.ui.shipments.map','tracking-ui-shipments-map',SOURCE.UI + '/shipments/map'),
        deployModule('tracking.ui.shipment','tracking-ui-shipment',SOURCE.UI + '/shipment'),
        deployModule('tracking.ui.shipment.map','tracking-ui-shipment-map',SOURCE.UI + '/shipment/map'),
        deployModule('tracking.ui.shipment.reports','tracking-ui-shipment-reports',SOURCE.UI + '/shipment/reports'),
        deployModule('tracking.ui.shipment.filterbar','tracking-ui-shipment-filterbar',SOURCE.UI + '/shipment/filterbar'),
        deployModule('tracking.ui.theme','tracking-ui-theme',SOURCE.THEME)
    );
}

function deployAssets() {
    var bootstrap = gulp.src('./bower_components/bootstrap/dist/css/*min.css')
        .pipe(gulp.dest(DIST.DEV + '/css'));
    var fontawesomeCss = gulp.src('./bower_components/font-awesome/css/*min.css')
        .pipe(gulp.dest(DIST.DEV + '/css'));
    var visCss = gulp.src('./lib/vis/*min.css')
        .pipe(gulp.dest(DIST.DEV + '/css'));
    var metisMenu = gulp.src('./bower_components/metisMenu/dist/*min.css')
        .pipe(gulp.dest(DIST.DEV + '/css'));
    var jqueryCss = gulp.src('./bower_components/jquery-ui/themes/base/*.min.css')
        .pipe(gulp.dest(DIST.DEV + '/css'));
    var timepickerCss = gulp.src('./bower_components/jt.timepicker/*.css')
        .pipe(plugins.rename('jquery.timepicker.min.css'))
        .pipe(plugins.cleanCss())
        .pipe(gulp.dest(DIST.DEV + '/css'));
    var css = gulp.src([SOURCE.ROOT + '/assets/css/*.css', SOURCE.UI + '/**/*.css'])
        .pipe(plugins.concat('styles.css'))
        .pipe(gulp.dest(DIST.DEV + '/css'));
    var visImages = gulp.src('./lib/vis/img/**/*.png', { base: './lib/vis/img'})
        .pipe(gulp.dest(DIST.DEV + '/img'));
    var images = gulp.src(SOURCE.ROOT + '/assets/images/*.*')
        .pipe(gulp.dest(DIST.DEV + '/img'));
    var jqueryImages = gulp.src('./bower_components/jquery-ui/themes/base/images/*.png')
        .pipe(gulp.dest(DIST.DEV + '/css/images'));
    var glyphs = gulp.src('./bower_components/bootstrap/dist/fonts/*')
        .pipe(plugins.rename({dirname: ''}))
        .pipe(gulp.dest(DIST.DEV + '/fonts'));
    var fonts = gulp.src('./bower_components/font-awesome/fonts/*')
        .pipe(plugins.rename({dirname: ''}))
        .pipe(gulp.dest(DIST.DEV + '/fonts'));
    var themeCss = gulp.src([SOURCE.THEME + '/css/*.css'])
        .pipe(gulp.dest(DIST.DEV + '/css'));
    var themeImages = gulp.src(SOURCE.THEME + '/images/*.*')
        .pipe(gulp.dest(DIST.DEV + '/img'));
    var themeStatic = gulp.src(SOURCE.THEME + '/static/*.*')
        .pipe(gulp.dest(DIST.DEV + '/static'));
    var favIcon = gulp.src(SOURCE.THEME + '/favicon.ico')
        .pipe(gulp.dest(DIST.DEV));

    return es.merge(bootstrap, fontawesomeCss, visCss, metisMenu, css, jqueryCss, timepickerCss, themeCss, visImages, images, jqueryImages, themeImages, glyphs, fonts, themeStatic, favIcon);
}

function deployIisWebConfig() {
    if (argv.nowebconfig) {
        return null;
    }
    return gulp.src(SOURCE.THEME + '/web.config')
        .pipe(gulp.dest(DIST.DEV));
}

function deployIndex() {
    var css = gulp.src(DIST.DEV + '/css/*.css', { read: false })
        .pipe(plugins.order([
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
            'moment.js',
            'angular.js',
            'angular*.js'
        ]));

    var js = gulp.src(DIST.DEV + '/js/app/*.js', { read: false })
        .pipe(plugins.order([
            'tracking-api-host.js',
            'app.js'
        ]));

    var index = gulp.src(SOURCE.THEME + '/index.html')
        .pipe(plugins.replace('GOOGLE-MAPS-API-KEY', argv.gmapkey))
        .pipe(gulp.dest(DIST.DEV))
        .pipe(plugins.inject(css, {relative: true }))
        .pipe(plugins.inject(vendorJs, {relative: true, name: 'bower' }))
        .pipe(plugins.inject(js, {relative: true }))
        .pipe(gulp.dest(DIST.DEV));
    return index;
}

function deployModule(moduleName, fileName, dir) {
    var module = gulp.src(dir + '/*module.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var constants = gulp.src(dir + '/*constants.js')
        .pipe(plugins.replace('INSERT_API_HOST_URL', argv.apiurl))
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

    var filters = gulp.src(dir + '/*filter.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var routes = gulp.src(dir + '/*routes.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var runBlocks = gulp.src(dir + '/*run.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

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

    return es.merge(module, constants, services, controllers, directives, filters, routes, runBlocks, templates)
        .pipe(plugins.order(['*module.js', '*constants.js', '*service.js', '*controller.js', '*directive.js', '*filter.js', '*routes.js', '*run.js']))
        .pipe(plugins.concat(fileName + '.js'))
        .pipe(gulp.dest(DIST.DEV + '/js/app'));
}

function deployVendorJavascript() {
    var vendor = gulp.src(bowerfiles('**/*.js'))
        .pipe(plugins.order(['jquery.js', 'angular.js']))
        .pipe(gulp.dest(DIST.DEV + '/js/vendor'));

    var momentLocales = gulp.src('./bower_components/moment/min/locales.js')
        .pipe(gulp.dest(DIST.DEV + '/js/vendor'));

    var datePickerLocales = gulp.src('./bower_components/jquery-ui/ui/minified/i18n/*.min.js')
        .pipe(plugins.concat('datepicker-locales.min.js'))
        .pipe(gulp.dest(DIST.DEV + '/js/vendor'));

    var vis = gulp.src(SOURCE.LIB + '/vis/*.js', {base: SOURCE.LIB + '/vis'})
        .pipe(gulp.dest(DIST.DEV + '/js/vendor'));

    return es.merge(vendor, momentLocales, datePickerLocales, vis);
}

function releaseApp() {
    var deferred = Q.defer();
    rs('release-minify-css', 'release-assets', 'release-index', 'release-web-config', function() {
        deferred.resolve();
    });
    return deferred.promise;
}

function releaseAssets() {
    var packageCss = gulp.src(DIST.DEV + '/css/*.min.css')
        .pipe(plugins.order(['bootstrap.min.css', 'bootstrap-theme.min.css', 'font-awesome.min.css', 'metisMenu.min.css', 'vis.min.css', 'styles.min.css']))
        .pipe(plugins.concat('styles.css'))
        .pipe(gulp.dest(DIST.REL + '/css'));

    var fonts = gulp.src(DIST.DEV + '/fonts/*')
        .pipe(gulp.dest(DIST.REL + '/fonts'));

    var img = gulp.src(DIST.DEV + '/img/*')
        .pipe(gulp.dest(DIST.REL + '/img'));

    var cssImages = gulp.src(DIST.DEV + '/css/images/*')
        .pipe(gulp.dest(DIST.REL + '/css/images'));

    var vendorJs = gulp.src(DIST.DEV + '/js/vendor/*.js')
        .pipe(plugins.order(['jquery.js',
            'jquery*.js',
            'bootstrap.js',
            'moment.js',
            'angular.js',
            'angular*.js']))
        .pipe(plugins.concat('vendor.js'))
        .pipe(gulp.dest(DIST.REL + '/js'));

    var appJs = gulp.src(DIST.DEV + '/js/app/*.js')
        .pipe(plugins.order(['app.js']))
        .pipe(plugins.concat('tracking.js'))
        .pipe(plugins.uglify({preserveComments: 'license'}))
        .pipe(gulp.dest(DIST.REL + '/js'));

    var favIcon = gulp.src(SOURCE.THEME + '/favicon.ico')
        .pipe(gulp.dest(DIST.REL));

    return es.merge(packageCss, fonts, img, cssImages, vendorJs, appJs, favIcon);
}

function releaseIisWebConfig() {
    if (argv.nowebconfig) {
        return null;
    }
    return gulp.src(DIST.DEV + '/web.config')
        .pipe(gulp.dest(DIST.REL));
}

function releaseIndex() {
    var css = gulp.src(DIST.REL + '/css/*.css', { read: false });
    var vendorJs = gulp.src(DIST.REL + '/js/vendor.js', { read: false });
    var appJs = gulp.src(DIST.REL + '/js/tracking.js', { read: false });

    var index = gulp.src(SOURCE.THEME + '/index.html')
        .pipe(plugins.replace('GOOGLE-MAPS-API-KEY', argv.gmapkey))
        .pipe(gulp.dest(DIST.REL))
        .pipe(plugins.inject(css, {relative: true }))
        .pipe(plugins.inject(vendorJs, {relative: true, name: 'bower' }))
        .pipe(plugins.inject(appJs, {relative: true }))
        .pipe(plugins.htmlmin({collapseWhitespace:true, removeComments: true}))
        .pipe(gulp.dest(DIST.REL));
    return index;
}

function releaseMinifyCss() {
    var css = gulp.src(DIST.DEV + '/css/styles.css')
        .pipe(plugins.rename('styles.min.css'))
        .pipe(plugins.cleanCss())
        .pipe(gulp.dest(DIST.DEV + '/css'));

    var themeCss = gulp.src(DIST.DEV + '/css/theme.css')
        .pipe(plugins.rename('theme.min.css'))
        .pipe(plugins.cleanCss())
        .pipe(gulp.dest(DIST.DEV + '/css'));

    return es.merge(css, themeCss);
}

function runDev() {
    plugins.nodemon({script: 'server.js', ext: 'js', watch: [], env: {NODE_ENV: DIST.DEV}})
        //.on('change', ['validate-devserver-scripts'])
        .on('restart', function () {
            console.log('[nodemon] restarted dev server');
        });

    plugins.livereload.listen({ start: true });

    //setup watches
    gulp.watch(SOURCE.THEME + '/index.html', function() {
       return deployIndex()
           .pipe(plugins.livereload());
    });

    gulp.watch([SOURCE.ROOT + '/assets/css/*.css',SOURCE.UI + '/**/*.css', SOURCE.THEME + '/css/*.css', SOURCE.THEME + '/images/*.*'], function() {
        return deployAssets()
            .pipe(plugins.livereload());
    });

    gulp.watch(SOURCE.ROOT + '/*.js', function () {
        return deployApplication()
            .pipe(plugins.livereload());
    });

    gulp.watch([SOURCE.UI + '/**/*.js', SOURCE.UI + '/**/*.html', SOURCE.THEME + '/**/*.js', SOURCE.THEME + '/**/*.html'], function () {
       return deployApplicationModules()
           .pipe(plugins.livereload());
    });
}

function runRelease() {
    plugins.nodemon({script: 'server.js', ext: 'js', watch: [], env: {NODE_ENV: DIST.REL}})
        //.on('change', ['validate-devserver-scripts'])
        .on('restart', function () {
            console.log('[nodemon] restarted Node.js server');
        });
}

function updateLibAndDeploy() {
    var deferred = Q.defer();
    rs('clean-lib-projects' ,'import-lib-projects', ['deploy-assets', 'deploy-vendor-javascript', 'deploy-application', 'deploy-modules'],'deploy-index', 'deploy-web-config', function() {
        deferred.resolve();
    });
    return deferred.promise;
}

