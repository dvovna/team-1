var gulp = require('gulp')
  , gulpIgnore = require('gulp-ignore')
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
  var opts = {comments:true,spare:true};

  streamqueue(
    { objectMode: true }
    , gulp.src('blocks/**/*.html')
      .pipe(minifyHTML(opts))
      .pipe(gulp.dest('./dist/html'))
    , gulp.src(['dist/css/index.css'])
      .pipe(minifyCSS({keepBreaks:false}))
      .pipe(gulp.dest('./dist/css'))
    , gulp.src(
      [ 'blocks/**/*.js'
      , 'libs/codemirror/lib/codemirror.js'
      , 'libs/share-codemirror/share-codemirror.js'
      , 'libs/codemirror/mode/javascript/javascript.js'
      ]
    )
      .pipe(uglify())
      .pipe(gulp.dest('dist/js'))
    , gulp
      .src(
        [ 'libs/jquery/dist/jquery.min.js'
        , 'libs/lodash/dist/lodash.min.js'
        , 'dist/js/codemirror.js'
        , 'node_modules/share/webclient/share.js'
        , 'dist/js/share-codemirror.js'
        , 'dist/js/javascript.js'
        , 'libs/switchery/dist/switchery.min.js'
        , 'dist/js/page/page.js'
        , 'dist/js/**/*.js'
        ]
      )
      .pipe(concat('index.js'))
      .pipe(wrap('<script><%= contents %></script>'))
  )
    .pipe(concat('index.html'))
    .pipe(gulp.dest('./'))
})

gulp.task('index.html', function () {
  gulp
    .src(
      [ 'dist/**/*.css'
      , 'dist/**/*.html'
      , 'dist/**/*.js'
      ]
    )
    .pipe(concat('index.html'))
    .pipe(gulp.dest('./'))
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
  rimraf('dist', cb);
})

gulp.task('css', function () {
  streamqueue(
    { objectMode: true }
  , gulp
    .src(
      [ 'libs/codemirror/lib/codemirror.css'
        , 'libs/switchery/dist/switchery.min.css'
        , 'blocks/**/*.css'
      ]
    )
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

gulp.task('html', function () {
  gulp.src('blocks/**/*.html')
    .pipe(concat('index.html'))
    .pipe(gulp.dest('dist/html'))
})

gulp.task('js', function () {
  streamqueue(
      {objectMode: true},
      gulp.src(
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
    )
    .pipe(concat('index.js'))
    .pipe(wrap('<script><%= contents %></script>'))
    )
    .pipe(gulp.dest('dist/js'))
})

//gulp.task('default', runSequence( 'config', ['clean', 'index.min.html']))

gulp.task('watch', ['config', 'index.min.html', 'watch'])
gulp.task('nominify', ['config', 'index.html'])
