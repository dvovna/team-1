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

    expect(this.SwitcherySpy).toHaveBeenCalledWith(document.querySelector('.js-switch'))
  }

  function loadsSkins() {
    init()

    expect(jasmine.Ajax.requests.mostRecent().url).toBe('/theme')
  }

  function updatesDropdownWithSkins() {
    init()

    jasmine.Ajax.requests.mostRecent().response({
      "status": 200,
      "contentType": 'json',
      "responseText": JSON.stringify(["testthemename.css"])
    })

    expect($("#themes-list").find("[value='testthemename']").length).toBe(1)
  }
})
