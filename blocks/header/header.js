var Team1 = Team1 || {}

Team1.Header = function (options) {
  options = options || {}
  this.$el = $("header")
  this.$styleEl = $(".theme_style")
  this.themesSelectboxEl = this.$el.find("#themes-list")
  this.themeTemplate = _.template($("#theme-tpl").html())
  this.switcherEl = $("#switcher")
  this.Switcher = new Switchery(this.switcherEl.get(0), {})

  $.get(options.themesApi, _.bind(function (themes) {
    _.each(JSON.parse(themes), _.bind(function (theme) {
      this.themesSelectboxEl
        .append(this.themeTemplate({name: theme.split('.')[0]}))
    }, this))
  }, this))

  this.themesSelectboxEl.on("change", _.bind(function () {
    var themeName = this.themesSelectboxEl.val()
    $.get(options.themesApi, {name: themeName}, _.bind(function (data) {
      this.$styleEl.text(JSON.parse(data))
      this.$el.trigger("theme-change", themeName)
    }, this))
  }, this))

  this.switcherEl.on("change", _.bind(function () {
    var skinMode = this.switcherEl.is(":checked")
      ? Team1.SKIN_MODES.LIGHT
      : Team1.SKIN_MODES.DARK

    this.$el.trigger("skin-mode-change", skinMode)
  }, this))

  return _.extend(this.$el, this)
}
