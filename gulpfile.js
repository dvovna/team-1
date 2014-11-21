var gulp = require('gulp')
  , concat = require('gulp-concat')
  , autoprefixer = require('gulp-autoprefixer')
  , wrap = require('gulp-wrap')
  , watch = require('gulp-watch')
  , streamqueue = require('streamqueue')
  , karma = require('karma').server
  , rimraf = require('rimraf')
  , clean = require('gulp-clean')
  , uglify = require('gulp-uglify')
  , minifyCSS = require('gulp-minify-css')
  , minifyHTML = require('gulp-minify-html')
  , runSequence = require('run-sequence')
  , env = process.env.NODE_ENV || 'DEV'
  , resourses =
    { css:
      [ 'libs/codemirror/lib/codemirror.css'
      , 'libs/switchery/dist/switchery.min.css'
      , 'blocks/**/*.css'
    ]
    , js:
      [ 'libs/jquery/dist/jquery.min.js'
        , 'libs/lodash/dist/lodash.min.js'
        , 'libs/codemirror/lib/codemirror.js'
        , 'node_modules/share/webclient/share.uncompressed.js'
        , 'libs/share-codemirror/share-codemirror.js'
        , 'libs/codemirror/mode/javascript/javascript.js'
        , 'libs/switchery/dist/switchery.min.js'
        , 'blocks/page/page.js'
        , 'blocks/**/*.js'
      ]
  }

gulp.task('config', function () {
  var srcConfig = (env === 'PROD')
    ? './config/prod.json'
    : './config/dev.json'

  console.log('App is running in ' + env + ' environment')

  gulp
    .src(srcConfig)
    .pipe(concat('current.json'))
    .pipe(gulp.dest('./config'))
})

gulp.task('index.min.html', function () {
  runSequence(['html_min', 'js_min', 'css_min'], function () {
    gulp.src(
      [ 'dist/**/*.html'
        , 'dist/**/*.css'
        , 'dist/**/*.js'
      ]
    )
      .pipe(concat('index.html'))
      .pipe(gulp.dest('./'))
  })
})

gulp.task('index.html', function () {
  runSequence(['html', 'js', 'css'], function () {
    gulp.src(
      [ 'dist/**/*.html'
        , 'dist/**/*.css'
        , 'dist/**/*.js'
      ]
    )
      .pipe(concat('index.html'))
      .pipe(gulp.dest('./'))
  })
})

gulp.task('watch', function () {
  watch([ 'blocks/**/*.html'
        , 'blocks/**/*.css'
        , 'blocks/**/*.js']
        , function () {
    gulp.start('index.html')
  })
})

gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done)
})
gulp.task('tdd', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js'
  }, done)
})

gulp.task('clean', function (cb) {
  gulp.src('index.html', {read: false})
    .pipe(clean());
  gulp.src('index.min.html', {read: false})
    .pipe(clean());
  rimraf('dist', cb);
})

gulp.task('css', function () {
  streamqueue(
    { objectMode: true }
  , gulp
    .src(resourses.css)

    .pipe(concat('index.css'))
  )
  .pipe(autoprefixer(
      { browsers: ['last 3 versions']
      , cascade: true
      }
    ))
    .pipe(wrap('<style><%= contents %></style>'))
    .pipe(gulp.dest('dist/css'))
})
gulp.task('css_min', function () {
  streamqueue(
    { objectMode: true }
  , gulp
    .src(resourses.css)
    .pipe(concat('index.css'))
  )
  .pipe(autoprefixer(
      { browsers: ['last 3 versions']
      , cascade: true
      }
    ))
    .pipe(wrap('<style><%= contents %></style>'))
    .pipe(minifyCSS({keepBreaks:false}))
    .pipe(gulp.dest('dist/css'))
})
gulp.task('html', function () {
  gulp.src('blocks/**/*.html')
    .pipe(concat('index.html'))
    .pipe(gulp.dest('dist/html'))
})
gulp.task('html_min', function () {
  var opts = {comments:true, spare:true}

  gulp.src('blocks/**/*.html')
    .pipe(concat('index.html'))
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest('dist/html'))
})
gulp.task('js', function () {
  streamqueue(
      {objectMode: true},
      gulp.src(resourses.js)
    .pipe(concat('index.js'))
    .pipe(wrap('<script><%= contents %></script>'))
  )
    .pipe(gulp.dest('dist/js'))
})
gulp.task('js_min', function () {
  streamqueue(
      {objectMode: true},
      gulp.src(resourses.js)
    .pipe(concat('index.js'))
    .pipe(uglify())
    .pipe(wrap('<script><%= contents %></script>'))
  )
    .pipe(gulp.dest('dist/js'))
})

gulp.task('watch', runSequence(['config', 'index.html', 'watch']))

gulp.task('default', runSequence('config', 'index.min.html'))
