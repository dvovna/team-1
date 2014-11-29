describe("Header Unit Tests", function () {
  var mocked = {}

  beforeEach(before)
  afterEach(after)

  it("should init switchery", initSwitchery)
  it("should load skins", loadsSkins)
  it("should update skins selectbox with loaded skins", updatesDropdownWithSkins)
  it("should trigger mode_switch event with mode name")
  it("should trigger skin change event with skin name")

  function before() {
    jasmine.getFixtures().fixturesPath="base/blocks/"
    loadFixtures("header/header.html")

    this.SwitcherySpy = jasmine.createSpy()
    this.AjaxGetSpy = jasmine.createSpy("AjaxGetSpy")

    mocked.Switchery = window.Switchery || {}
    window.Switchery = this.SwitcherySpy
    mocked.AjaxGet = $.get || {}
    $.get = this.AjaxGetSpy
  }

  function after() {
    window.Switchery = mocked.Switchery
    $.get = mocked.AjaxGet
  }

  function init() {
    return new Team1.Header()
  }

  function initSwitchery() {
    init()

    expect(this.SwitcherySpy).toHaveBeenCalledWith(document.querySelector('.js-switch'))
  }

  function loadsSkins() {
    init()

    expect(this.AjaxGetSpy).toHaveBeenCalledWith('/theme', jasmine.any(Function))
  }

  function updatesDropdownWithSkins() {
    this.AjaxGetSpy.and.returnValue(['testfilename'])
    init()

    expect($("#themes-list").find("[value=testfilename]")).toBeInDOM()
  }
})
