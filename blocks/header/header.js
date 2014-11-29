var Team1 = Team1 || {}

Team1.Header = function () {
  this.themesSelectboxEl = $("#themes-list")
  this.themeTemplate = _.template($("#theme-tpl").html())
  this.switcherEl = $("#switcher")
  this.Switcher = new Switchery($('.js-switch').get(0), {})

  $.get('/theme', _.bind(function (themes) {
    _.each(JSON.parse(themes), _.bind(function(theme) {
      this.themesSelectboxEl.html(this.themeTemplate({name: theme.split('.')[0]}))
    }, this))
  }, this))

  this.themesSelectboxEl.on("change", _.bind(function () {
    $(this).trigger("theme-change", this.themesSelectboxEl.val())
  }, this))

  this.switcherEl.on("change", _.bind(function () {
    var skinMode = this.switcherEl.is(":checked")
      ? Team1.SKIN_MODES.LIGHT
      : Team1.SKIN_MODES.DARK

      $(this).trigger("skin-mode-change", skinMode)
  }, this))
}
