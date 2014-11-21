var http = require('http')
  , url = require('url')
  , fs = require('fs')
  , logPrefix = 'HTTP Server'
  , log = require('npmlog')
  , isStarted = false
  , path = require('path')


function saveDocument (jsonDoc) {
  if (!fs.existsSync(__dirname + path.sep + 'savedDocuments')) {
    fs.mkdirSync(__dirname + path.sep + 'savedDocuments')
  }

  fs.writeFileSync( __dirname + path.sep + 'savedDocuments'
  + path.sep + jsonDoc.docName, jsonDoc.docContent )
}

function getDocument (docId) {
  var pathToDoc = __dirname + path.sep + 'savedDocuments' + path.sep + docId

  return fs.existsSync(pathToDoc) ?  fs.readFileSync(pathToDoc, 'utf8') : null
}


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
        else if (request.method == 'POST') {
          var body = ''
          request.on('data', function (data) {
            body += data
          });
          request.on('end', function () {
            var jsonBody = JSON.parse(body)
            if (jsonBody.operation == 'save') {
              saveDocument(jsonBody)
            }
            else if (jsonBody.operation == 'get') {
              var docContent = getDocument(jsonBody.docName)
              var docObj = {
                value: docContent
              }

              var docJSON = JSON.stringify(docObj)

              if (docJSON !== null) {
                response.end(docJSON)
              }
              else {
                response.end()
              }

            }

          });
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
