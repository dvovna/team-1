var Team1 = Team1 || {}

Team1.Header = function () {
  new Switchery(document.querySelector('.js-switch'))


  $.get('/theme', function (data) {
  });

  //inits switchery
  //loads skins
  //triggers event on skin_mode changed
  //triggers event on editor's skin changed with skin_name
}
