module.exports = function(config) {
  config.set(
    { frameworks: ['jasmine-jquery', 'jasmine-ajax', 'jasmine']

    , files:
      [ 'libs/jquery/dist/jquery.min.js'
      , 'libs/lodash/dist/lodash.min.js'
      , 'libs/switchery/dist/switchery.min.js'
      , 'blocks/page/page.js'
      , 'blocks/header/header.js'
      , 'blocks/editor/editor.js'
      , 'blocks/roster/roster.js'
      , 'tests/**/*unit.js'
      , 'tests/**/*intgr.js'
      , 'blocks/**/*.html'
      , 'index.html'
    ]

    , preprocessors:
    { // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'blocks/**/*.js': ['coverage']
    }

    , browsers: ['Firefox']

    , autoWatch: true
    }
  )
}
