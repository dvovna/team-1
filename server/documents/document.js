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
  /**
   * Attach new user to the document
   * @param collaborator {User}
   * @returns {Document}
   */
  , addCollaborator: function (collaborator) {
    if (!this.isPresent(collaborator)) {
      this.notifyCollaborators({ a: 'join'
        , user : collaborator.exportPublicData()
      })
      this.collaborators.push(collaborator)
    }
    return this
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
    }
    return this
  }

  , isPresent: function (collaborator) {
    return _.contains(this.collaborators, collaborator)
  }

  , exportOnlyId: function () {
    return { id: this.id }
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
})
