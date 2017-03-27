function VideoMultichatManagement(ws, growl) {
    var streaming = document.getElementById('videoMultichatId');
    var source = document.getElementById('videoMultichatSource');

    source.onerror = function () {
        growl.error('The URL provided is not a valid video', {
            title: 'Error'
        });
    };
}