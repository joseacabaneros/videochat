var config = {};

//Heroku assigns the value through the PORT environment variable. You cannot choose
config.port = process.env.HTTP_PORT || process.env.PORT || 3000;

//Video streaming no adaptativo de nuestro servidor IIS
config.streamingUrl = 'https://156.35.98.12:8443/video/something.mp4'; //https
//config.streamingUrl = 'http://156.35.98.12:9999/video/something.mp4'; //http

//EN CONFIG.JS DEL LADO DEL CLIENTE!
//Video dash streaming adaptativo de servidor apache
config.dashUrl = 'https://156.35.98.12/videodash/manifest.mpd';

//Shoutcast emision http://156.35.98.12:8001/listen.pls
config.radioUrl = 'http://156.35.98.12:8001/;';

config.videoUrl = 'https://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4';
config.audioUrl = 'http://ruhit.imgradio.pro:80/RusHit48'; //shoutcast (in .pls file)
//config.audioUrl = 'http://stream.dancewave.online:8080/dance.mp3';

config.presentationUrl = 'reveal-js/index.html';

module.exports = config;