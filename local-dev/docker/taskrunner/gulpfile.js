var interactive = false;

const Nonce = require('nonce-fast'),
  nonce = Nonce(9);

var
  argv = require('yargs').argv,
  async = require('async'),
  autoprefixer = require('autoprefixer'),
  babel = require('gulp-babel'),
  colors = require('ansi-colors'),
  consolidate = require('gulp-consolidate'),
  eyeglass = require('eyeglass'),
  flexbugs = require('postcss-flexbugs-fixes'),
  gulp = require('gulp'),
  gulpif = require('gulp-if'),
  log = require('fancy-log'),
  plumber = require('gulp-plumber'),
  postcss = require('gulp-postcss'),
  sanewatch = require('gulp-sane-watch'),
  sass = require('gulp-sass'),
  save = require('gulp-save'),
  sourcemaps = require('gulp-sourcemaps');

// within the container,
//   /app/assets is the source parent
//   /app/dist is the output parent

// used by the font generator
var runTimestamp = Math.round(Date.now() / 1000);


var paths = {
  sass: ['assets/scss/**/*.scss'],
  lib: ['assets/lib/**/*.js'],
  js: ['assets/js/**/*.js'],
  images: ['assets/images/**/*'],
  fonts: ['assets/fonts/**/*'],
  dist_css: 'dist/css',
  dist_js: 'dist/js',
  dist_lib: 'dist/js/lib',
  dist_images: 'dist/images',
  dist_fonts: 'dist/fonts'
};

// Error reporter for plumber.
var plumber_error = function(err) {
  if (!interactive) {
    throw err;
  }
  log(colors.red(err));
  this.emit('end');
};

// application and third-party SASS -> CSS
gulp.task('styles', function() {
  var sassOptions = {
    outputStyle: 'nested',
    eyeglass: {

    }
  };


  return gulp.src(paths.sass)
    .pipe(plumber({
      errorHandler: plumber_error
    }))

    // If not in production mode, generate a sourcemap
    .pipe(gulpif(!argv.production, sourcemaps.init()))
    .pipe(sass(eyeglass(sassOptions)))
    .pipe(postcss([
      autoprefixer(['last 2 versions', '> 1%']),
      flexbugs()
    ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist_css));
});

// Copy images from src to PL source destination
// (after optimizing them, if enabled)
gulp.task('images', function() {
  return gulp.src(paths.images)
    .pipe(plumber({
      errorHandler: plumber_error
    }))
    .pipe(gulp.dest(paths.dist_images));
});

// Copy images from src to PL source destination
// (after optimizing them, if enabled)
gulp.task('fonts', function() {
  return gulp.src(paths.fonts)
    .pipe(plumber({
      errorHandler: plumber_error
    }))
    .pipe(gulp.dest(paths.dist_fonts));
});

gulp.task('js', function() {
  var babelOptions = {
    presets: [
      ['env', {
        'targets': {
          'browsers': ['> 2% in US', 'safari >= 7']
        }
      }]
    ]
  };

  return gulp.src(paths.js)
    .pipe(plumber({
      errorHandler: plumber_error
    }))
    .pipe(sourcemaps.init())
    .pipe(babel(babelOptions))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist_js));
});

gulp.task('lib', function() {
  return gulp.src(paths.lib)
    .pipe(gulp.dest(paths.dist_lib));
});

// build-all builds everything in one go.
gulp.task('build-all', ['styles', 'lib', 'js', 'images', 'fonts']);

// all the watchy stuff
gulp.task('watcher', ['build-all'], function() {

  // handle errors gracefully
  interactive = true;

  // sane is a more configurable watcher than gulp watch.
  // You can also have it use the more friendly OSX file
  // watcher "watchman", but that apparently has to be
  // installed by hand instead of through a dependency
  // manager.
  //
  // Installation instructions for Watchman:
  // https://facebook.github.io/watchman/docs/install.html
  //
  // Usage for gulp-sane-watch:
  // https://www.npmjs.com/package/gulp-sane-watch

  //var watcherOptions = { debounce:300,watchman:true };
  var watcherOptions = {
    debounce: 1000,
    watchman: false
  };

  sanewatch(paths.sass, watcherOptions,
    function() {
      gulp.start('styles');
    }
  );

  sanewatch(paths.js, watcherOptions,
    function() {
      gulp.start('js');
    }
  );

  sanewatch(paths.lib, watcherOptions,
    function() {
      gulp.start('lib');
    }
  );

  sanewatch(paths.images, watcherOptions,
    function() {
      gulp.start('images');
    }
  );

  sanewatch(paths.fonts, watcherOptions,
    function() {
      gulp.start('fonts');
    }
  );
});

// Default build task
gulp.task('default', function() {
  gulp.start('watcher');
});
