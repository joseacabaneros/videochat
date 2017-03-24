function DashvideoManagement() {
    var video,context,player;
    video = document.getElementById('dashvideoId');
    context = new Webm.di.WebmContext();
    player = new MediaPlayer(context);
    player.startup();
    player.attachView(video);
    player.setAutoPlay(true);
    player.attachSource(config.dashUrl); //url del mpd adaptativo
}