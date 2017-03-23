function StreamingManagement(ws, growl) {
    var streaming = document.getElementById('streamingId');
    var source = document.getElementById('streamingSource');

    source.onerror = function () {
        growl.error('The URL provided is not a valid non-adaptative streaming video', {
            title: 'Error'
        });
    };
}