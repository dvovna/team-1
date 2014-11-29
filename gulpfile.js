var gulp = require('gulp')
  , concat = require('gulp-concat')
  , autoprefixer = require('gulp-autoprefixer')
  , wrap = require('gulp-wrap')
  , watch = require('gulp-watch')
  , streamqueue = require('streamqueue')
  , karma = require('karma').server
  , clean = require('gulp-clean')
  , uglify = require('gulp-uglify')
  , minifyCSS = require('gulp-minify-css')
  , minifyHTML = require('gulp-minify-html')
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
  var opts = {comments:true, spare:true}

  streamqueue(
    {objectMode: true}
    , gulp.src('blocks/**/*.html')
      .pipe(concat('index.html'))
      .pipe(minifyHTML(opts))
    , gulp.src(resourses.js)
      .pipe(concat('index.js'))
      .pipe(uglify())
      .pipe(wrap('<script><%= contents %></script>'))

    , gulp.src(resourses.css)
      .pipe(concat('index.css'))
      .pipe(autoprefixer(
        { browsers: ['last 3 versions']
        , cascade: true
        }
      ))
      .pipe(wrap('<style><%= contents %></style>'))
      .pipe(minifyCSS({keepBreaks:false}))
    )
    .pipe(concat('index.html'))
    .pipe(gulp.dest('./'))
})

gulp.task('index.html', function () {
  streamqueue(
    {objectMode: true}
    , gulp.src('blocks/**/*.html')
      .pipe(concat('index.html'))
    , gulp.src(resourses.js)
      .pipe(concat('index.js'))
      .pipe(wrap('<script><%= contents %></script>'))
    , gulp.src(resourses.css)
      .pipe(concat('index.css'))
      .pipe(autoprefixer(
        { browsers: ['last 3 versions']
          , cascade: true
        }
      ))
      .pipe(wrap('<style><%= contents %></style>'))
  )
    .pipe(concat('index.html'))
    .pipe(gulp.dest('./'))
})

gulp.task('watch', ['config'], function () {
  watch([ 'blocks/**/*.html'
        , 'blocks/**/*.css'
        , 'blocks/**/*.js']
        , function () {
    gulp.start('index.html')
  })
})

gulp.task('test', ['index.html'], function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done)
})
gulp.task('tdd', ['index.html'], function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js'
  }, done)
})

gulp.task('clean', function (cb) {
  gulp.src(
    [ 'index.html'
    , 'config/current.json']
    , {read: false})
    .pipe(clean())
})

gulp.task('default', ['config', 'index.min.html'])
