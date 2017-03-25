angular.module('multichatApp', ['angular-websocket', 'ngMaterial', 'angular-growl',
    'ui.bootstrap', 'ngCookies', 'ngSanitize', 'thatisuday.dropzone', 'vcRecaptcha']);

var config = {};
config.maxSizeAttachment = 500000; //500 KB

//Video dash streaming adaptativo de servidor apache
config.dashUrl = 'https://156.35.98.12/videodash/manifest.mpd';