function RadioManagement(ws, growl) {
    var radio = document.getElementById('radioId');
    var source = document.getElementById('radioSource');

    source.onerror = function () {
        growl.error('The URL provided is not a valid radio', {
            title: 'Error'
        });
    };
}