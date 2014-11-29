var Team1 = Team1 || {}

Team1.Header = function () {
  this.skinsSelectboxEl = $("#themes-list")
  this.skinsTemplate = _.template($("#skins-tpl").html())

  this.Switcher = new Switchery($('.js-switch').get(0), {})

  $.get('/theme', _.bind(function (themes) {
    _.each(themes, _.bind(function(theme) {
      this.skinsSelectboxEl.html(this.skinsTemplate({name: theme.split('.')[0]}))
    }, this))
  }, this))

  //triggers event on skin_mode changed
  //triggers event on editor's skin changed with skin_name
}
