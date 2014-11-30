var Team1 = Team1 || {}

$(document).ready(function () {
  Team1.start(
    { socketUrl: 'ws://' + window.location.hostname + ":7900"
      , themeApiUrl: "/theme"
    }
  )
})
