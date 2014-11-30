describe("Page Integration Tests", function () {
  var socketHandlers = {}

  beforeEach(before)
  afterEach(function () {
    jasmine.Ajax.uninstall()
  })

  describe("Initialization", function () {
    it("should show promt on init", showPromptTest)
    it("should send socket message on ok click with user's name", sendSocketMessageTest)
  })

  describe("Roster manipulations", function () {
    it("should fill user's list on open", onOpenFillUsersListTest)
    it("should remove existing user from list on close", onRemoveExistingUserTest)
    it("should add new user to list on join", onJoinNewUserTest)
  })

  function getTestDocObj() {
    return {
      subscribe: function () {}
    , whenReady: function () {}
    , setOnOpenMessageFn: function (handler) {
      socketHandlers['open'] = handler
    }
    , setOnJoinMessageFn: function (handler) {
      socketHandlers['join'] = handler
    }
    , setOnCloseMessageFn: function (handler) {
      socketHandlers['leave'] = handler
    }
    , setOnMetaMessageFn: function (handler) {
      socketHandlers['meta'] = handler
    }
    }
  }

  function before () {
    jasmine.getFixtures().fixturesPath = "base/"

    this.promptSpy = spyOn(window, "prompt").and.returnValue('')
    //to prevent from running App in index.html, see page.js
    spyOn($.fn, "ready").and.callFake(function () {})

    loadFixtures("index.html")

    jasmine.Ajax.install()
    createTestSocket.call(this)

    spyOn(window, "WebSocket").and.returnValue(this.testSocket)
    spyOn(window.sharejs, "Connection").and.returnValue({
      get: function () {
        return getTestDocObj()
      }
    })

    this.usersListEl = $(".roster-list")
  }

  function showPromptTest() {
    Team1.start({socketUrl: "/testUrl"})

    expect(window.prompt).toHaveBeenCalledWith("Your name:")
  }
  function sendSocketMessageTest () {
    var testTitle = "test dima"

    spyOn(this.testSocket, "sendSync")
    spyOn(_, "random").and.returnValue(100)

    this.promptSpy.and.returnValue(testTitle)

    Team1.start({socketUrl: "/testUrl"})

    expect(this.testSocket.sendSync).toHaveBeenCalledWith(JSON.stringify(
      { a: 'open'
      , user:
        { title: testTitle
        }
        , document:
        { id: 100
        }
      } )
    )
  }
  function onOpenFillUsersListTest () {
    Team1.start({socketUrl: "/test"})

    socketHandlers['open'].call({}
      , {
        document:
        { users:
          [ {
            id: 1
          , title: "test1"
          , color: "black"
          }
          , {
            id: 2
          , title: "test1"
          , color: "black"
          }
          , {
            id: 3
          , title: "test1"
          , color: "black"
          }
          ]
        }
      }
    )

    expect(this.usersListEl).toContainElement("li#1.roster-item")
    expect(this.usersListEl).toContainElement("li#2.roster-item")
    expect(this.usersListEl).toContainElement("li#3.roster-item")
  }
  function onJoinNewUserTest() {
    Team1.start({socketUrl: "/test"})

    socketHandlers['open'].call({}, {})
    socketHandlers['join'].call({}
      , { user:
          { id: 1
          , title: "test1"
          , color: "black"
          }
        }
      )

    expect(this.usersListEl).toContainElement("li#1.roster-item")
    expect(this.usersListEl.find(".roster-item").text()).toBe("test1")
  }
  function onRemoveExistingUserTest() {
    Team1.start({socketUrl: "/test"})

    socketHandlers['open'].call({}, {})

    this.usersListEl.append("<li id='12'>test</li>")

    socketHandlers['leave'].call({}, {user: {id: 12}})

    expect(this.usersListEl).not.toContainElement("li#12")
  }

  function createTestSocket() {
    this.testSocket =
    { readyState: 1
    , send: function () {}
    , sendSync: function () {}
    }
  }
})
