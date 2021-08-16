
var navbar = '<nav class="navbar navbar-expand-lg navbar-light">\
  <a class="navbar-brand" href="#">\
    <div class="logo">\
      <img src="images/elg-logo-v2.png">\
    </div>\
  </a>\
  <button class="navbar-toggler" type="button" data-toggle="collapse"\
    data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup"\
    aria-expanded="false" aria-label="Toggle navigation">\
    <span class="navbar-toggler-icon"></span>\
  </button>\
  <div class="collapse navbar-collapse" id="navbarNavAltMarkup">\
    <div class="navbar-nav">\
      <a class="nav-item nav-link" href="about.html">About</a>\
      <a class="nav-item nav-link" href="log-food.html">Create Entry</a>\
      <a class="nav-item nav-link" href="log.html">Food Log</a>\
      <a href="feedback.html" class=" nav-item nav-link">Share feedback</a>\
      <a class="nav-item nav-link" href="javascript:EatLogGo.signOut();">Signout</a>\
    </div>\
  </div>\
</nav>';

var guestNavbar = '<nav class="navbar navbar-expand-lg navbar-light">\
  <a class="navbar-brand" href="#">\
    <div class="logo">\
      <img src="images/elg-logo-v2.png">\
    </div>\
  </a>\
  <button class="navbar-toggler" type="button" data-toggle="collapse"\
    data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup"\
    aria-expanded="false" aria-label="Toggle navigation">\
    <span class="navbar-toggler-icon"></span>\
  </button>\
  <div class="collapse navbar-collapse" id="navbarNavAltMarkup">\
    <div class="navbar-nav">\
      <a class="nav-item nav-link" href="about.html">About</a>\
      <a class="nav-item nav-link" href="index.html">Login</a>\
      <a class="nav-item nav-link" href="register.html">Signup</a>\
    </div>\
  </div>\
</nav>';

if(window.location.pathname.includes("index.html") || window.location.pathname.includes("register.html")) {
    document.write(guestNavbar)
} else {
if(!EatLogGo.loggedInUser) {
  document.write(guestNavbar);
} else {
  document.write(navbar);
}}


