var Team1 = Team1 || {}

Team1.Editor = function (options) {
  _.bindAll(this)
  this.options = _.extend(options || {}, this.defaults)
  this.socket = this.options.socket || {}

  this.codeEditor = CodeMirror.fromTextArea($("#docEditor")[0],
    { lineNumbers: true
    , matchBrackets: true
    , foldGutter: true        //сворачивание кода
    , mode: "javascript"
    }
  )

  this.codeEditor.on("cursorActivity", _.bind(this.onCursorActivity, this))
  this.cursors = []
  this.selections = []
}

Team1.Editor.prototype.onCursorActivity = function () {
  var meta =
    { a: "meta"
    , document: { id: this.options.documentId }
    , id: this.options.user.id
    , color: this.options.user.color
    , meta:
      { cursorInfo: this.codeEditor.getCursor()
      , listSelections: this.codeEditor.listSelections()
      }
    }

  this.socket.sendSync(meta)
}
/**
 * public handler
 */
Team1.Editor.prototype.onSocketMeta = function (data) {
  //this.updateCursor(
  //  { id: data.id
  //  , position : data.meta.cursorInfo
  //  , color : data.color
  //  }
  //)
  this.updateSelection(
    { id: data.id
    , position: data.meta.listSelections
    , color: data.color
    }
  )
}
//need to impl better way...
Team1.Editor.prototype.addCursor = function (cursorInfo) {
  var opt = { className: this.getCursorClass(cursorInfo, false) }
    , to =
    { ch: cursorInfo.position.ch + 1
    , line: cursorInfo.position.line
    }
    , cursor = this.codeEditor.markText(cursorInfo.position, to, opt)

  if (!cursor.lines.length) {
    cursor = this.addCursorOnLineEnd(cursorInfo, to, opt)
  }

  $(document.getElementsByClassName(cursor.className))
    .css("border-color", cursorInfo.color)

  this.cursors.push({id: cursorInfo.id, cursor: cursor})
}

Team1.Editor.prototype.getCursorClass = function (info, isLast) {
  var classStr = isLast ? "cm-cursor-last" : "cm-cursor"
  return classStr + " cursor-id-" + info.id
}

Team1.Editor.prototype.addCursorOnLineEnd = function (cursorInfo, to, opt) {
  opt.className = this.getCursorClass(cursorInfo, true)
  to.ch = cursorInfo.position.ch - 1

  return this.codeEditor.markText(to, cursorInfo.position, opt)
}

Team1.Editor.prototype.updateCursor = function (cursorInfo) {
  this.removeCursor(cursorInfo.id)
  this.addCursor(cursorInfo)
}

Team1.Editor.prototype.removeCursor = function (id) {
  var item = _.find(this.cursors, function (item) {
    return item.id === id
  })

  if (item) {
    item.cursor.clear()
    this.cursors.splice(_.indexOf(this.cursors, item), 1)
  }
}

Team1.Editor.prototype.addSelection = function (selectionInfo) {
  var opt = {}
    , sel
    , pos = selectionInfo.position[0] || {}
    , from
    , to

  if (pos.head.ch > pos.anchor.ch) {
    from  = pos.anchor
    to = pos.head
  } else {
    from = pos.head
    to = pos.anchor
  }
  opt.className = this.getSelectionClass(selectionInfo.id, selectionInfo.color)
  sel = this.codeEditor.markText(from, to, opt)

  $(document.getElementsByClassName(sel.className))
    .css("background-color", selectionInfo.color)

  this.selections.push({ id: selectionInfo.id, sel: sel })
}

Team1.Editor.prototype.getSelectionClass = function (id) {
  return "selection-id-" + id
}

Team1.Editor.prototype.updateSelection = function (selectionInfo) {
  this.removeSelection(selectionInfo.id)
  this.addSelection(selectionInfo)
}

Team1.Editor.prototype.removeSelection = function (id) {
  var item = _.find(this.selections, function (item) {
    return item.id === id
  })

  if (item) {
    item.sel.clear()
    this.selections.splice(_.indexOf(this.selections, item), 1)
  }
}

Team1.Editor.prototype.setTheme = function (theme) {
  this.codeEditor.setOption("theme", theme)
}
