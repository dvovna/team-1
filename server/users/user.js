var _ = require('lodash-node')
  , Duplex = require('stream').Duplex
  , livedb = require('livedb')
  , sharejs = require('share')
  , backend = livedb.client(livedb.memory())
  , share = sharejs.server.createClient({ backend: backend })

  , getUID = function () { return _.uniqueId('user-') }

  , Documents = require('../documents')
  , User = module.exports = function (options) {
    var _connection = this._connection =  options.connection
      , _stream = this._stream = Duplex({ objectMode: true })

    this.id = getUID()
    this.document = null
    this.props = { title: 'Anonymous' }

    _stream._write = function (chunk, encoding, callback) {
      _connection.send(JSON.stringify(chunk))
      return callback()
    }

    _stream._read = function () {}

    _stream.headers = _connection.upgradeReq.headers
    _stream.remoteAddress = _connection.upgradeReq.connection.remoteAddress

    _connection
      .on('message', _.bind(this.onMessage, this))
      .on('close', _.bind(this.onClose, this))

    _stream
      .on('error', function (msg) {
        console.log('error', msg)
        return _connection.close(msg)
      })
      .on('end', function () {
        return _connection.close()
      })

    share.listen(_stream)
  }

_.extend(User.prototype, {
  onMessage: function (data) {
    data = JSON.parse(data)

    if (data.a === 'open') {
      this.onOpenEvent(data)
      return
    }

    return this._stream.push(data)
  }
  , onClose: function (reason) {
    this._stream.push(null)
    this._stream.emit('close')
    this.destroy()
    return this._connection.close(reason)
  }
  /**
   * Fire event on client
   * @param data
   * @returns {User}
   */
  , emit: function (data) {
    this._connection.send(JSON.stringify(data))
    return this
  }
  , exportOnlyId: function () {
    return { id: this.id }
  }
  /**
   * object with user's id + title
   * @returns {*}
   */
  , exportPublicData: function () {
    return _.extend(this.exportOnlyId(), { title: this.props.title })
  }
  /**
   * owner data
   * @returns {*}
   */
  , exportPrivateData: function () {
    return _.extend(this.exportPublicData(), {})
  }

  , openDocument: function (document) {
    this.document = Documents.factory(document).addCollaborator(this)
    return this.emit({ a: 'open'
      , user: this.exportPrivateData()
      , document: this.document.exportPublicData()
    })
  }

  , closeDocument: function () {
    if (this.document !== null) this.document.removeCollaborator(this)
    return this
  }
  /**
   * Update user data/props on open event
   * @param data
   * @returns {User}
   */
  , updateData: function (data) {
    delete data.id

    _.extend( this.props
      , data
      , function (a, b) { return b ? b : a }
    )

    return this
  }

  , onOpenEvent: function (data) {
    if (data.user) this.updateData(data.user)
    return this.openDocument(data.document)
  }

  , destroy: function () {
    return this.closeDocument()
  }
})
