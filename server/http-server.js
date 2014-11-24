var http = require('http')
  , url = require('url')
  , fs = require('fs')
  , logPrefix = 'HTTP Server'
  , log = require('npmlog')
  , isStarted = false

exports.start = function (config) {
  if (config && !isStarted) {
    try {
      http.createServer(function (request, response) {
        log.http(logPrefix, request.method + ' request', request.url)

        var urlParsed = url.parse(request.url, true)
          , urlParsedQueryName = urlParsed.query.name

        if (urlParsed.pathname == '/theme' && urlParsedQueryName) {
          var themePath = 'libs/codemirror/theme/' + urlParsedQueryName

          fs.readFile(themePath + '.css', 'utf8',  function (err, data) {
            if (err) throw err

            response.end(JSON.stringify(data))
          })
        }
        else if (urlParsed.pathname == '/theme' && !urlParsedQueryName) {
          fs.readdir('libs/codemirror/theme/', function (err, files) {
            if (err) throw err

            response.end(JSON.stringify(files))
          })
        }
        else {
          fs.readFile(config.index, function (err, page) {
            if (err) {
              log.error(logPrefix, err.message)
              response.writeHeader(500)
              response.end('Can\'t read ' + config.index +
                           ' file. (Try to create it: npm run make)')
              return
            }

            response.writeHeader(200, {'Content-Type': 'text/html'})
            response.write(page)
            response.end()
          })
        }
      }).listen(config.port)
      log.info(logPrefix, 'Server started at port ' + config.port)
      isStarted = true
    } catch (e) {
      log.error(logPrefix, 'Server can\'t start. ' + e)
    }
  }
}
