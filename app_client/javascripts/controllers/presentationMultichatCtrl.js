angular.module('multichatApp')
    .controller('presentationMultichatCtrl', function ($scope, webSocketManager) {
        //Send a message to the server with the user that is connected
        var sub = $scope.sub.split("%"); //userName%name
        webSocketManager.presentationMultichatManagement.setUser(sub[0], sub[1]);
    });