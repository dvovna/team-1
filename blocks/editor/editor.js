var Team1 = Team1 || {}

Team1.Editor = function (options) {
  this.options = _.extend(options || {}, this.defaults)

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
  var cursor = this.codeEditor.getCursor()
  var meta = {
    a: "meta"
    , document: {
      id: Team1.documentId
    }
    , id: Team1.__user.id
    , color: Team1.__user.color
    , meta: cursor
  }
  Team1.send(JSON.stringify(meta))
}

Team1.Editor.prototype.addCursor = function (cursorInfo) {
  var opt = {className: this.getCursorClass(cursorInfo.id, cursorInfo.color)}
    , to = {
      ch: cursorInfo.position.ch + 1,
      line: cursorInfo.position.line
    }

  var cursor = this.codeEditor.markText(cursorInfo.position, to, opt)
  if (cursor.lines.length)
    this.cursors.push({id: cursorInfo.id, cursor: cursor})
  else
    this.addCursorOnLineEnd(cursorInfo)
}

Team1.Editor.prototype.getCursorClass = function (id, color) {
  return "cm-cursor cm-cursor-" + color + " cursor-id-" + id
}

Team1.Editor.prototype.addCursorOnLineEnd = function (cursorInfo) {
  var opt = {
      className: this.getCursorClassAfter(cursorInfo.id, cursorInfo.color)
    }
    , to = {
      ch: cursorInfo.position.ch - 1,
      line: cursorInfo.position.line
    }

  var cursor = this.codeEditor.markText(to, cursorInfo.position, opt)
  this.cursors.push({id: cursorInfo.id, cursor: cursor})
}

Team1.Editor.prototype.getCursorClassAfter = function (id, color) {
  return "cm-cursor-last cm-cursor-last-" + color + " cursor-id-" + id
}

Team1.Editor.prototype.updateCursor = function (cursorInfo) {
  this.removeCursor(cursorInfo.id)
  this.addCursor(cursorInfo)
  $(".cursor-id-"+cursorInfo.id+"").css("border-color",cursorInfo.color)
}

Team1.Editor.prototype.removeCursor = function (id) {
  for (var i = this.cursors.length - 1; i >= 0; i--) {
    if (this.cursors[i].id === id) {
      this.cursors[i].cursor.clear()
      this.cursors.splice(i, 1)
    }
  }
}

Team1.Editor.prototype.addSelection = function (selectionInfo) {
  var opt = {
    className: this.getSelectionClass(selectionInfo.id, selectionInfo.color)
  }

  var sel = this.codeEditor.markText(selectionInfo.from, selectionInfo.to, opt)
  this.selections.push({id: selectionInfo.id, sel: sel})
}

Team1.Editor.prototype.getSelectionClass = function (id, color) {
  return "cm-background-" + color + " selection-id-" + id
}

Team1.Editor.prototype.updateSelection = function (selectionInfo) {
  this.removeSelection(selectionInfo.id)
  this.addSelection(selectionInfo)
}

Team1.Editor.prototype.removeSelection = function (id) {
  for (var i = this.selections.length - 1; i >= 0; i--) {
    if (this.selections[i].id === id) {
      this.selections[i].sel.clear()
      this.selections.splice(i, 1)
    }
  }
}

Team1.Editor.prototype.setTheme = function (theme) {
  this.codeEditor.setOption("theme", theme)
}
