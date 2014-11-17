var _ = require('lodash-node')
  // Generator uniq id for documents
  , getUID = function () { return _.uniqueId('file-') }
  , Documents = {}
  , Document = module.exports = function (props) {
      var id

      props = props || {}
      id = this.id = props.id || getUID()

      if (Documents[id] instanceof Document) return Documents[id]

      this.collaborators = []
      this.availableColors = ['#36D7B7', '#19B5FE', '#BF55EC', '#F62459',
        '#FFA400', '#044F67', '#CA6924', '#ABB7B7', '#26C281', '#5D8CAE']
      this.props = props

      delete this.props.id
      Documents[id] = this
    }

_.extend(Document.prototype, {
  /**
   * fire on each actual user event with data
   * @param data {Object}
   * @param [collaborators] {Array}
   * @returns {Document}
   */
  notifyCollaborators: function (data, collaborators) {
    _.each( collaborators || this.collaborators
      , function (collaborator) {
        if (this.isPresent(collaborator)) collaborator.emit(data)
      }
      , this
    )
    return this
  }
  , metaCollaborators: function (source, data) {
    _.each(this.collaborators, function (collaborator) {
      if (source.id !== collaborator.id) {
        collaborator.emit({
          a: 'meta',
          id: data.id,
          color: data.color,
          meta: data.meta
        })
      }
    }, this)
    return this
  }
  /**
   * Attach new user to the document
   * @param collaborator {User}
   * @returns {Document}
   */
  , addCollaborator: function (collaborator) {
    if (!this.isPresent(collaborator)) {
      collaborator.setColor(this.getAvailableColor())

      this.notifyCollaborators({ a: 'join'
        , user : collaborator.exportPublicData()
      })
      this.collaborators.push(collaborator)
    }
    return this
  }

  , getAvailableColor: function () {
    var color = this.availableColors[0] || this.getRandomColor()

    _.pull(this.availableColors, color)

    return color
  }
  /**
   * Detach collaborator from document
   * @param collaborator {User}
   * @returns {Document}
   */
  , removeCollaborator: function (collaborator) {
    if (this.isPresent(collaborator)) {
      _.pull(this.collaborators, collaborator)
      this.notifyCollaborators({ a: 'leave'
        , user: collaborator.exportOnlyId()
      })
      this.restoreColor(collaborator.getColor())
    }
    return this
  }

  , isPresent: function (collaborator) {
    return _.contains(this.collaborators, collaborator)
  }

  , exportOnlyId: function () {
    return { id: this.id }
  }

  , restoreColor: function (color) {
    var colorsArr = []

    colorsArr.push(color)
    _.union(colorsArr, this.availableColors)

    this.availableColors = colorsArr
  }
  /**
   * exports data for each user
   * @returns {*}
   */
  , exportPublicData: function () {
    return _.extend( this.exportOnlyId()
      , { users: _.map( this.collaborators
        , function (collaborator) {
          return collaborator.exportPublicData()
        }
      )
      }
    )
  }
  , getRandomColor: function () {
    var letters = ('0123456789ABCDEF').split('')
      , color = '#'
      , i = 0;

    for (i; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
    }

    return color
  }
})
