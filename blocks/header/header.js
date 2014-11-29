var Team1 = Team1 || {}

Team1.Header = function () {
  this.skinsSelectboxEl = $("#themes-list")
  this.skinsTemplate = _.template($("#skins-tpl").html())
  this.switcherEl = $("#switcher")
  this.Switcher = new Switchery($('.js-switch').get(0), {})

  $.get('/theme', _.bind(function (themes) {
    _.each(JSON.parse(themes), _.bind(function(theme) {
      this.skinsSelectboxEl.html(this.skinsTemplate({name: theme.split('.')[0]}))
    }, this))
  }, this))

  this.switcherEl.on("change", _.bind(function () {
    var skinMode = this.switcherEl.is(":checked")
      ? Team1.SKIN_MODES.LIGHT
      : Team1.SKIN_MODES.DARK

      $(this).trigger("skin-mode-change", skinMode)
  }, this))
}
