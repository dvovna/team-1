var Team1 = Team1 || {}

Team1 = {
  start: function (options) {
    this.options = _.extend(options, this.defaults)

    this.$body = $("body")

    _.bindAll(this)

    this.setDefaultSkinMode(this.SKIN_MODES.LIGHT)

    this.header = new Team1.Header({
      themesApi: this.options.themeApiUrl
    })
      .on("theme-change", this.onEditorThemeChange)
      .on("skin-mode-change", this.onSkinModeChange)

    this.documentId = this.getDocId()

    this.socket = this.getSocket(this.options.socketUrl)
    this.sjs = new window.sharejs.Connection(this.socket)
    this.doc = this.sjs.get('users-' + this.documentId, 'seph')

    this.bindSocketHandlers()

    this.auth().done(this.openDocument)
  }
  , getDocId: function () {
    return this.getDocIdFromHash() || _.random(10000000000)
  }
  , getDocIdFromHash: function () {
    return window.location.hash.replace('#', '')
  }

  , auth: function () {
    var user = {
      title: window.prompt('Your name:')
    }

    this.__user = user

    return $.Deferred().resolve(user).promise()
  }

  /**
   * Create interface for document
   */
  , buildDocumentInterface: function (document) {
    this.Roster = new Team1.Roster()
    this.Editor = new Team1.Editor({socket: this.socket})

    this.doc.subscribe()

    this.doc.whenReady(_.bind(function () {
      if (!this.doc.type) this.doc.create('text')

      if (this.doc.type && this.doc.type.name === 'text')
        this.doc.attachCodeMirror(this.Editor.codeEditor)

      if(document.content)
        this.Editor.codeEditor.getDoc().setValue(document.content)
    }, this))

    if (document.users)
      this.Roster.fillList(document.users)

    window.location.hash = '#' + document.id
  }

  , openDocument: function () {
    this.socket.sendSync(JSON.stringify(
      { a: 'open'
      , user: this.__user
      , document:
        { id: this.documentId
        }
      }
    ) )

    return this
  }

  , bindSocketHandlers: function () {
    this.doc.setOnOpenMessageFn(this.onSocketOpen)
    this.doc.setOnJoinMessageFn(this.onSocketJoin)
    this.doc.setOnCloseMessageFn(this.onSocketLeave)
    this.doc.setOnMetaMessageFn(this.onSocketMeta)
  }

  , onSocketJoin: function (data) {
    this.Roster.add(data.user)
  }

  , onSocketLeave: function (data) {
    this.Roster.remove(data.user.id)
    this.Editor.removeCursor(data.user.id)
  }

  , onSocketOpen: function (data) {
    if (data.user)
      _.extend(this.__user, data.user)

    this.buildDocumentInterface(data.document || {})
  }

  , onSocketMeta : function (data) {
    this.Editor.updateCursor(
      { id: data.id
      , position : data.meta
      , color : data.color
      }
    )
  }

  , onEditorThemeChange: function (e, theme) {
    this.Editor.setTheme(theme)
  }

  , setDefaultSkinMode: function (skinMode) {
    this.$body.addClass(skinMode)
  }

  , onSkinModeChange: function () {
    var classesToToggle = this.SKIN_MODES.LIGHT + " " + this.SKIN_MODES.DARK
    this.$body.toggleClass(classesToToggle)
  }

  , getSocket : function (url) {
    WebSocket.prototype._waitForConnection = function (callback, interval) {
      if (this.readyState === 1)
      { callback()
      } else {
        setTimeout(function ()
          { this._waitForConnection(callback)
          }
          , interval)
      }
    }
    WebSocket.prototype.sendSync = function (message) {
      this._waitForConnection(_.bind(function () {
        this.send(message)
      }, this), 1000)
    }
    return new WebSocket(url)
  }
}
Team1.SKIN_MODES = {
  LIGHT: 'light'
, DARK: 'dark'
}

Team1.defaults = {
  skinMode: Team1.SKIN_MODES.LIGHT
}

$(document).ready(function () {
  Team1.start(
    { socketUrl: 'ws://' + window.location.hostname + ":7900"
    , themeApiUrl: "/theme"
    }
  )
})
