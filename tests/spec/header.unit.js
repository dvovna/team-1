describe("Header Unit Tests", function () {
  var mocked = {}

  beforeEach(before)
  afterEach(after)

  it("should init switchery", initSwitchery)
  it("should load skins", loadsSkins)
  it("should update skins selectbox with loaded skins", updatesDropdownWithSkins)
  it("should trigger mode_switch event with mode name", triggerModeSwitchEvent)
  it("should trigger skin change event with skin name", triggerSkinChangeEvent)

  function before() {
    jasmine.getFixtures().fixturesPath="base/blocks/"
    loadFixtures("header/header.html")

    this.SwitcherySpy = jasmine.createSpy()
    this.AjaxGetSpy = jasmine.createSpy("AjaxGetSpy")

    mocked.Switchery = window.Switchery || {}
    window.Switchery = this.SwitcherySpy
    jasmine.Ajax.install()
  }

  function after() {
    window.Switchery = mocked.Switchery
    jasmine.Ajax.uninstall()
  }

  function init() {
    return new Team1.Header()
  }

  function initSwitchery() {
    init()

    expect(this.SwitcherySpy).toHaveBeenCalledWith($('.js-switch')[0], {})
  }

  function loadsSkins() {
    init()

    expect(jasmine.Ajax.requests.mostRecent().url).toBe('/theme')
  }

  function updatesDropdownWithSkins() {
    init()

    jasmine.Ajax.requests.mostRecent().response({
      "status": 200,
      "contentType": 'text/plain',
      "responseText": '["testthemename.css"]'
    })

    expect($("#themes-list").find("[value='testthemename']").length).toBe(1)
  }

  function triggerModeSwitchEvent() {
    init()

    spyOn($.fn, "trigger").and.callThrough()
    $("#switcher").prop("checked", false).trigger('change')

    expect($.fn.trigger).toHaveBeenCalledWith("skin-mode-change", Team1.SKIN_MODES.DARK)
  }

  function triggerSkinChangeEvent() {
    init()

    spyOn($.fn, "trigger").and.callThrough()
    $("#themes-list").append("<option value='ata'>Oo</option>")
    $("#themes-list").val("ata").trigger('change')

    expect($.fn.trigger).toHaveBeenCalledWith("theme-change", 'ata')
  }
})
