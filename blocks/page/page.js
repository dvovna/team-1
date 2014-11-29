var Team1 = Team1 || {}

Team1 = {
  start: function (options) {
    _.bindAll(this)

    this.header = new Team1.Header()
    this.header
      .on("theme-change", this.onEditorThemeChange)
      .on("skin-mode-change", this.onSkinModeChange)

    this.documentId = this.getDocId()

    this.socket = this.getSocket(options.socketUrl)
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
    this.Editor = new Team1.Editor()

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
    this.send(JSON.stringify(
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

  , send: function (message, callback) {
    var self = this

    this.waitForConnection(function () {
      self.socket.send(message)

      if (typeof callback !== 'undefined') {
        callback()
      }
    }, 1000)
  }

  , waitForConnection: function (callback, interval) {
    var that = this

    if (this.socket.readyState === 1)
    { callback()
    } else {
      setTimeout(function ()
        { that.waitForConnection(callback)
        }
        , interval)
    }
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

  , onSkinModeChange: function (e, skinMode) {
    var $header = $(".header")
      , $roster = $(".roster")

    if (skinMode === Team1.SKIN_MODES.LIGHT) {
      $header.removeClass("header--dark").addClass("header--light")
      $roster.removeClass("roster--dark").addClass("roster--light")
    } else {
      $header.removeClass("header--light").addClass("header--dark")
      $roster.removeClass("roster--light").addClass("roster--dark")
    }
  }

  , getSocket : function (url) {
    return new WebSocket(url)
  }
}

Team1.SKIN_MODES = {
  LIGHT: 'light',
  DARK: 'dark'
}

$(document).ready(function () {
  Team1.start(
    { socketUrl: 'ws://' + window.location.hostname + ":7900"
    }
  )
})
