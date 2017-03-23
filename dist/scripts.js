angular.module('multichatApp')
    .controller('audioCtrl', ["$scope", "webSocketManager", "$uibModal", function ($scope, webSocketManager, $uibModal) {
        $scope.muteAudioModel = webSocketManager.audioManagement.isMuted();
        $scope.changeMuteAudioModel = function () {
            webSocketManager.audioManagement.setMuted($scope.muteAudioModel);
        };

        $scope.showAudioModal = function (selectAudio, url, accept, cancel) {
            var modal = {
                'selectAudio': selectAudio,
                'url': url,
                'accept': accept,
                'cancel': cancel
            };
            var modalInstance = $uibModal.open({
                templateUrl: 'templates/audioUrlModal.html',
                controller: 'audioModalCtrl',
                resolve: {
                    data: function () {
                        return modal;
                    },
                }
            }).result.then(function (result) {
                webSocketManager.audioManagement.playAudio(result);
            });
        };
    }]);
angular.module('multichatApp')
    .controller('audioModalCtrl', ["$scope", "$uibModalInstance", "data", function ($scope, $uibModalInstance, data) {
        $scope.data = data;
        $scope.close = function (result) {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.accept = function (result) {
            result = $scope.url;
            $uibModalInstance.close(result);
        };
    }]);
angular.module('multichatApp')
    .controller('drawingCtrl', ["$scope", "webSocketManager", function ($scope, webSocketManager) {
        $scope.addCircle = function () {
            webSocketManager.drawingManagement.addCircle();
        };
        $scope.addRectangle = function () {
            webSocketManager.drawingManagement.addRectangle();
        };
        $scope.addTriangle = function () {
            webSocketManager.drawingManagement.addTriangle();
        };
        $scope.getPencil = function () {
            webSocketManager.drawingManagement.getPencil();
        };
        $scope.getSelection = function () {
            webSocketManager.drawingManagement.getSelection();
        };
        $scope.clearAll = function () {
            webSocketManager.drawingManagement.clearAll();
        };
    }]);
angular.module('multichatApp')
    .controller('geolocationCtrl', ["$scope", "webSocketManager", function ($scope, webSocketManager) {
        //Send a message to the server with the user that is connected
        var sub = $scope.sub.split("%"); //userName%name
        webSocketManager.geolocationManagement.setUser(sub[0], sub[1]);
    }]);
angular.module('multichatApp')
    .controller('loginCtrl', ["$scope", "$http", "$window", "$cookies", function ($scope, $http, $window, $cookies) {
        $scope.data = {};
        $scope.data.errorShow = false;
        $scope.data.userNotValid = false;
        $scope.submit = function (login) {
            console.log(login);
            $http({
                method: "POST",
                url: "/api/login",
                data: angular.toJson(login),
                headers: {'Content-Type': 'application/json'}
            }).then(success, error);
        };

        function success(res) {
            $scope.data.errorShow = false;
            $scope.data.userNotValid = false;
            $cookies.put('token', res.data.token);

            if ($scope.redirect != 'undefined')
                $window.location.href = $scope.redirect;
            else
                $window.location.href = '/multichat';
        }

        function error(res) {
            if (res.status == 401) {
                $scope.data.userNotValid = true;
            } else {
                $scope.data.error = res.statusText + ' (' + res.status + ')';
                $scope.data.errorShow = true;
            }
        }
    }]);
angular.module('multichatApp')
    .controller('logoutCtrl', ["$cookies", function ($cookies) {
        $cookies.remove('token');
    }]);
angular.module('multichatApp')
    .controller('messagesCtrl', ["$scope", "webSocketManager", "$uibModal", function ($scope, webSocketManager, $uibModal) {
        //Send a message to the server with the user that is connected
        var sub = $scope.sub.split("%"); //userName%name
        webSocketManager.messagesManagement.setUser(sub[0], sub[1]);
        $scope.userName = sub[0];
        $scope.data = {};
        $scope.data.loading = webSocketManager.messagesManagement.isLoading();
        $scope.data.messages = webSocketManager.messagesManagement.getMessages();
        $scope.comment = '';

        $scope.commentSent = function () {
            webSocketManager.messagesManagement.sendMessage($scope.comment);
            $scope.comment = '';
        };

        $scope.checkEnter = function (event) {
            if (event.keyCode == 13) { //ASCII for enter
                webSocketManager.messagesManagement.sendMessage($scope.comment);
                $scope.comment = '';
            }
        };

        $scope.iconSent = function (icon) {
            $scope.comment += icon;
        };

        $scope.showAllEmojis = function () {
            $scope.showEmojis = !$scope.showEmojis;
        };

        $scope.showFileModal = function (selectAudio, url, accept, cancel) {
            var modalInstance = $uibModal.open({
                templateUrl: 'templates/messageFileModal.html',
                controller: 'messagesFileModalCtrl',
            }).result.then(function (result) {
                if (result == "Too big") {
                    webSocketManager.messagesManagement.showError("The file cannot be sent " +
                        "because it exceeds the maximum allowed size");
                } else {
                    switch (result.type) {
                        case "image/png":
                        case "image/gif":
                        case "image/jpeg":
                            webSocketManager.messagesManagement.sendFile(result, "picture");
                            break;
                        default:
                            webSocketManager.messagesManagement.sendFile(result, "attached");
                            break;
                    }
                }
            });
        };

        $scope.showPictureOpenModal = function (picture) {
            var modal = {
                'picture': picture,
            };
            var modalInstance = $uibModal.open({
                templateUrl: 'templates/messagePictureOpenModal.html',
                controller: 'messagesPictureOpenModalCtrl',
                size: 'lg',
                resolve: {
                    data: function () {
                        return modal;
                    },
                }
            })
        };
    }]
);
angular.module('multichatApp')
    .controller('messagesFileModalCtrl', ["$scope", "$uibModalInstance", function ($scope, $uibModalInstance) {
        //This will prevent Dropzone to instantiate on it's own unless you are using
        // dropzone class for styling
        Dropzone.autoDiscover = false;

        $scope.dzCallbacks = {
            'addedfile': function (file) {
                if (file.size < config.maxSizeAttachment)
                    $uibModalInstance.close(file);
                else
                    $uibModalInstance.close("Too big");
            },
        };
    }]);
angular.module('multichatApp')
    .controller('messagesPictureOpenModalCtrl', ["$scope", "$uibModalInstance", "data", function ($scope, $uibModalInstance, data) {
        $scope.data = data;
    }]);
angular.module('multichatApp')
    .controller('peopleCtrl', ["$scope", "webSocketManager", function ($scope, webSocketManager) {
        //Send a message to the server with the user that is connected
        var sub = $scope.sub.split("%"); //userName%name
        webSocketManager.peopleManagement.setConnected(sub[0], sub[1]);

        $scope.data = {};
        //At the beginning there is an animation showing that the info is loading
        $scope.data.loading = webSocketManager.peopleManagement.isLoading();
        //When $scope.data.loading and $scope.data.people change, the list of users is shown
        $scope.data.people = webSocketManager.peopleManagement.getPeople();
    }]);
angular.module('multichatApp')
    .controller('presentationCtrl', ["$scope", "webSocketManager", function ($scope, webSocketManager) {
        //Send a message to the server with the user that is connected
        var sub = $scope.sub.split("%"); //userName%name
        webSocketManager.presentationManagement.setUser(sub[0], sub[1]);
    }]);
angular.module('multichatApp')
    .controller('profileCtrl', ["$scope", "$http", "$window", "$cookies", function ($scope, $http, $window, $cookies) {
        $scope.data = {};
        $scope.data.errorShow = false;
        $scope.data.okShow = false;

        $scope.submit = function (profile) {
            $http({
                method: "PUT",
                url: "/api/profile",
                data: angular.toJson(profile),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(success, error);
        };

        $scope.submitDelete = function (profile) {
            $http({
                method: "DELETE",
                url: "/api/delete/" + profile.userName,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(successDelete, error);
        };

        function success(res) {
            $scope.data.errorShow = false;
            $scope.data.okShow = true;
            $cookies.put('token', res.data.token);
        }

        function successDelete(res) {
            $cookies.remove('token');
            $window.location.href = '/index';
        }

        function error(res) {
            $scope.data.error = res.statusText + ' (' + res.status + ')';
            $scope.data.errorShow = true;
            $scope.data.okShow = false;
        }
    }]);
angular.module('multichatApp')
    .controller('registerCtrl', ["$scope", "$http", "$window", "$cookies", function ($scope, $http, $window, $cookies) {
        $scope.data = {};
        $scope.data.errorShow = false;

        $scope.submit = function (login) {
            $http({
                method: "POST",
                url: "/api/register",
                data: angular.toJson(login),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(success, error);
        };

        function success(res) {
            $scope.data.errorShow = false;
            $cookies.put('token', res.data.token);
            $window.location.href = '/multichat';
        }

        function error(res) {
            $scope.data.error = res.statusText + ' (' + res.status + ')';
            $scope.data.errorShow = true;
        }
    }]);
angular.module('multichatApp')
    .controller('videoconferenceCtrl', ["$scope", "webSocketManager", function ($scope, webSocketManager) {
        $scope.data = {};
        $scope.data.loading = webSocketManager.videoconferenceManagement.isLoading();

        //Send a message to the server with the user that is connected
        var sub = $scope.sub.split("%"); //userName%name
        webSocketManager.videoconferenceManagement.setUser(sub[0], sub[1]);

        $scope.disableVideoconferenceModel =
            webSocketManager.videoconferenceManagement.isDisabled();
        $scope.changeDisableVideoconferenceModel = function () {
            webSocketManager.videoconferenceManagement.setDisabled(
                $scope.disableVideoconferenceModel);
        };

        $scope.muteVideoconferenceModel = webSocketManager.videoconferenceManagement.isMuted();
        $scope.changeMuteVideoconferenceModel = function () {
            webSocketManager.videoconferenceManagement.setMuted($scope.muteVideoconferenceModel);
        };
    }]);
angular.module('multichatApp')
    .controller('videoCtrl', ["$scope", "webSocketManager", "$uibModal", function ($scope, webSocketManager, $uibModal) {
        $scope.muteVideoModel = webSocketManager.videoManagement.isMuted();
        $scope.changeMuteVideoModel = function () {
            webSocketManager.videoManagement.setMuted($scope.muteVideoModel);
        };

        $scope.showVideoModal = function (selectVideo, url, accept, cancel) {
            var modal = {
                'selectVideo': selectVideo,
                'url': url,
                'accept': accept,
                'cancel': cancel
            };
            var modalInstance = $uibModal.open({
                templateUrl: 'templates/videoUrlModal.html',
                controller: 'videoModalCtrl',
                resolve: {
                    data: function () {
                        return modal;
                    },
                }
            }).result.then(function (result) {
                webSocketManager.videoManagement.playVideo(result);
            });
        };
    }]);
angular.module('multichatApp')
    .controller('videoModalCtrl', ["$scope", "$uibModalInstance", "data", function ($scope, $uibModalInstance, data) {
        $scope.data = data;
        $scope.close = function (result) {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.accept = function (result) {
            result = $scope.url;
            $uibModalInstance.close(result);
        };
    }]);
angular.module('multichatApp')
    .directive("compareTo", function () {
        return {
            restrict: 'A',
            require: "ngModel",
            scope: {
                elementToCompare: "=compareTo"
            },
            link: function (scope, element, attributes, modelVal) {

                modelVal.$validators.compareTo = function (val) {
                    return val == scope.elementToCompare;
                };

                scope.$watch("elementToCompare", function () {
                    modelVal.$validate();
                });
            }
        };
    });
angular.module('multichatApp')
    .directive("userNameAvailable", ["$http", "$q", function ($http, $q) {
        return {
            restrict: 'A',
            require: "ngModel",
            link: function (scope, element, attributes, modelVal) {

                modelVal.$asyncValidators.userNameAvailable = function (val) {

                    var defer = $q.defer();

                    $http.get("api/users/" + val, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).then(success, error);

                    function success(res) {
                        scope.data.errorShow = false;
                        if (res.data.length > 0) { //the user already exists
                            modelVal.$setValidity('userNameAvailable', false);
                            defer.reject("Username has already been taken");
                        } else {
                            modelVal.$setValidity('userNameAvailable', true);
                            defer.resolve();
                        }
                    }

                    function error(res) {
                        scope.data.error = res.statusText + ' (' + res.status + ')';
                        scope.data.errorShow = true;
                        modelVal.$setValidity('userNameAvailable', false);
                        defer.reject("An error has been occurred");
                    }
                    return defer.promise;
                }

            }
        };
    }]);
angular.module('multichatApp')
    .filter("emojis", ["$sce", function ($sce) {
        var space = / /g;
        var line = /\n/g;
        var laughing = /:D/g;
        var smile = /:\)/g;
        var wink = /;\)/g;
        var kiss = /:x/g;
        var kiss2 = /:\*/g;
        var tongueWink = /;-\)/g;
        var tongue = /:-P/g;
        var embarrassing = /:S/g;
        var sad = /:\(/g;
        var happy = /:o\)/g;
        var confused = /%\)/g;
        var crying = /:'\(/g;
        var happyCrying = /:'\)/g;
        var disgust = /D=%/g;
        var horror = /D:%/g;
        var angry = /:\[/g;
        var cool = /\|O\)/g;
        var car = /:-C/g;
        var city = /:-L/g;
        var koala = /:-K/g;
        return function (input) {
            var output = input.replace(space, '&nbsp;');
            output = output.replace(line, '<br>');
            output = output.replace(laughing, '<img src="images/emojis/smiley-01.png" width="20px" height="20px">');
            output = output.replace(smile, '<img src="images/emojis/smiley-05.png" width="20px" height="20px">');
            output = output.replace(wink, '<img src="images/emojis/smiley-06.png" width="20px" height="20px">');
            output = output.replace(kiss, '<img src="images/emojis/smiley-07.png" width="20px" height="20px">');
            output = output.replace(kiss2, '<img src="images/emojis/smiley-08.png" width="20px" height="20px">');
            output = output.replace(tongueWink, '<img src="images/emojis/smiley-12.png" width="20px" height="20px">');
            output = output.replace(tongue, '<img src="images/emojis/smiley-14.png" width="20px" height="20px">');
            output = output.replace(embarrassing, '<img src="images/emojis/smiley-15.png" width="20px" height="20px">');
            output = output.replace(sad, '<img src="images/emojis/smiley-17.png" width="20px" height="20px">');
            output = output.replace(happy, '<img src="images/emojis/smiley-18.png" width="20px" height="20px">');
            output = output.replace(confused, '<img src="images/emojis/smiley-19.png" width="20px" height="20px">');
            output = output.replace(crying, '<img src="images/emojis/smiley-22.png" width="20px" height="20px">');
            output = output.replace(happyCrying, '<img src="images/emojis/smiley-23.png" width="20px" height="20px">');
            output = output.replace(disgust, '<img src="images/emojis/smiley-32.png" width="20px" height="20px">');
            output = output.replace(horror, '<img src="images/emojis/smiley-33.png" width="20px" height="20px">');
            output = output.replace(angry, '<img src="images/emojis/smiley-35.png" width="20px" height="20px">');
            output = output.replace(cool, '<img src="images/emojis/smiley-41.png" width="20px" height="20px">');
            output = output.replace(car, '<img src="images/emojis/orte-59.png" width="20px" height="20px">');
            output = output.replace(city, '<img src="images/emojis/orte-15.png" width="20px" height="20px">');
            output = output.replace(koala, '<img src="images/emojis/natur-09.png" width="20px" height="20px">');
            return $sce.trustAsHtml(output);
        };
    }]);
angular.module('multichatApp')
    .filter("pictures", ["$sce", function ($sce) {
        return function (input) {
            var output = '<img src="' + input.binary + '" width="50px" height="50px">';
            output += '<p>' + input.name + '</p>';
            return $sce.trustAsHtml(output);
        };
    }]);
angular.module('multichatApp')
    .config(['growlProvider', function (growlProvider) {
        growlProvider.globalPosition('bottom-right');
        growlProvider.globalTimeToLive(2000);
    }]);

angular.module('multichatApp')
    .config(["dropzoneOpsProvider", function (dropzoneOpsProvider) {
        dropzoneOpsProvider.setOptions({
            url: '/',
            dictDefaultMessage: 'Drop your picture or your file to be attached. ' + 'You can also click here to open the File dialog'
        });
    }]);

//to remove the unsafe tag before the URLs when I share files converted with readAsDataURL
angular.module('multichatApp')
    .config(['$compileProvider', function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(data):/);
    }]);
angular.module('multichatApp')
    .service('utils', function () {
        function isJson(str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        }

        var methods = {isJson: isJson};
        return methods;
    });
angular.module('multichatApp')
    .service('webSocketManager', ["$websocket", "growl", "utils", function ($websocket, growl, utils) {
        if (!window.WebSocket) {
            console.log("WebSockets NOT supported.");
            alert("Consider updating your browser for a better experience.");
        }

        var HOST = location.origin.replace(/^http/, 'ws');
        var ws = $websocket(HOST);
        var peopleManagement = new PeopleManagement(ws, growl);
        var messagesManagement = new MessagesManagement(ws, growl);
        var geolocationManagement = new GeolocationManagement(ws, growl);
        var streamingManagement = new StreamingManagement(ws, growl);
        var radioManagement = new RadioManagement(ws, growl);
        var videoManagement = new VideoManagement(ws, growl);
        var audioManagement = new AudioManagement(ws, growl);
        var videoconferenceManagement = new VideoconferenceManagement(ws, growl);
        var drawingManagement = new DrawingManagement(ws);
        var presentationManagement = new PresentationManagement(ws, growl);

        ws.onOpen(function () {
            peopleManagement.setLoading(false);
            messagesManagement.setLoading(false);
            videoconferenceManagement.setLoading(false);
            growl.success('Server started. Enjoy!', {title: 'Success',});
            setInterval(function () {
                ws.send('ping at ' + new Date().getUTCSeconds());
            }, 30000);
        });

        window.onbeforeunload = function () {
            //disconnect current user
            geolocationManagement.setDisconnected();
            peopleManagement.setDisconnected();
            videoconferenceManagement.setDisconnected();
            ws.close();
        };

        ws.onMessage(function (message) {
            if (utils.isJson(message.data)) {
                var obj = JSON.parse(message.data);
                switch (obj.section) {
                    case "people":
                        if (obj.data.operation == 'connected')
                            peopleManagement.addPerson(obj.data);
                        else if (obj.data.operation == 'disconnected')
                            peopleManagement.deletePerson(obj.data);
                        break;
                    case "messages":
                        messagesManagement.addMessage(obj.data);
                        break;
                    case "video":
                        videoManagement.updateVideoUrl(obj.data.url);
                        break;
                    case "audio":
                        audioManagement.updateAudioUrl(obj.data.url);
                        break;
                    case "videoconference":
                        videoconferenceManagement.getMessage(obj.data);
                        break;
                    case "drawings":
                        if (obj.data.operation == 'add')
                            drawingManagement.addObject(obj.data.type, obj.data.info);
                        else if (obj.data.operation == 'clearAll')
                            drawingManagement.clearObjects();
                        break;
                    case "geolocation":
                        if (obj.data.operation == 'connected')
                            geolocationManagement.addMarker(obj.data);
                        else if (obj.data.operation == 'disconnected')
                            geolocationManagement.deleteMarker(obj.data);
                        break;
                    case "presentation":
                        presentationManagement.updateSlide(obj.data);
                        break;
                }
            }
        });

        var methods = {
            ws: ws,
            peopleManagement: peopleManagement,
            messagesManagement: messagesManagement,
            streamingManagement: streamingManagement,
            radioManagement: radioManagement,
            videoManagement: videoManagement,
            audioManagement: audioManagement,
            videoconferenceManagement: videoconferenceManagement,
            drawingManagement: drawingManagement,
            geolocationManagement: geolocationManagement,
            presentationManagement: presentationManagement
        };

        return methods;
    }]);
function AudioManagement(ws, growl) {
    var muted = false;
    var audio = document.getElementById('audioId');
    var source = document.getElementById('audioSource');

    source.onerror = function () {
        growl.error('The URL provided is not a valid audio', {
            title: 'Error'
        });
    };

    this.setMuted = function (mute) {
        muted = mute;
    };

    this.isMuted = function () {
        return muted;
    };

    this.playAudio = function (url) {
        sendData(url);
    };

    this.updateAudioUrl = function (url) {
        if (!muted) {
            source.src = url;
            audio.load();
            audio.play();
        }
    };

    function sendData(url) {
        ws.send(JSON.stringify({
            'section': 'audio',
            'data': {
                'url': url,
            }
        }));
    }
}
function DrawingManagement(ws) {
    var canvas = new fabric.Canvas('canvas');
    canvas.setHeight(350);
    canvas.setWidth(350);
    canvas.freeDrawingBrush.color = 'green';
    canvas.freeDrawingBrush.lineWidth = 10;

    this.addCircle = function () {
        var obj = {
            radius: 20,
            fill: 'green',
            left: 100,
            top: 100
        };
        sendData('Circle', obj, 'add');
    };

    this.addRectangle = function () {
        var obj = {
            top: 100,
            left: 100,
            width: 60,
            height: 70,
            fill: 'red'
        };
        sendData('Rectangle', obj, 'add');
    };

    this.addTriangle = function () {
        var obj = {
            width: 20,
            height: 30,
            fill: 'blue',
            left: 50,
            top: 50
        };
        sendData('Triangle', obj, 'add');
    };

    this.getPencil = function () {
        canvas.isDrawingMode = true;
    };

    this.getSelection = function () {
        canvas.isDrawingMode = false;
    };

    this.clearAll = function (type, info) {
        sendData('', '', 'clearAll');
    };

    this.addObject = function (type, info) {
        var shape;
        if (type == 'Triangle') {
            shape = new fabric.Triangle(info);
        } else if (type == 'Rectangle') {
            shape = new fabric.Rect(info);
        } else if (type == 'Circle') {
            shape = new fabric.Circle(info);
        }
        canvas.add(shape);
    };

    this.clearObjects = function (type, info) {
        canvas.clear();
    };

    function sendData(type, info, operation) {
        ws.send(JSON.stringify({
            'section': 'drawings',
            'data': {
                'operation': operation,
                'type': type,
                'info': info,
            }}));
    }
}
function GeolocationManagement(ws, growl) {
    var preLatitude;
    var preLongitude;
    var image = 'images/funchat.png';
    var markers = [];
    var map;
    var _this = this;
    var user;

    var oviedo = new google.maps.LatLng(43.383, -5.824);
    if ("geolocation" in navigator) {
        map = new google.maps.Map(document.getElementById('map'), {
            center: oviedo,
            zoom: 3,
        });
        navigator.geolocation.watchPosition(geolocationSuccess, geolocationError);
    } else {
        growl.error('The browser is not compatible with the Geolocation HTML5 API', {
            title: 'Error'
        });
    }

    this.addMarker = function (data) {
        var marker = new google.maps.Marker({
            position: {
                lat: data.latitude,
                lng: data.longitude
            },
            icon: image,
            animation: google.maps.Animation.DROP,
            draggable: true,
            map: map
        });

        var markerAndUser = {
            marker: marker,
            userName: data.userName
        };

        markers.push(markerAndUser);
        var infowindow = new google.maps.InfoWindow({
            content: data.name
        });

        marker.addListener('click', function () {
            infowindow.open(map, marker);
        });
    };

    this.setUser = function (userName, name) {
        user = {
            userName: userName,
            name: name
        };
    };

    this.deleteMarker = function (data) {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].userName == data.userName) {
                markers[i].marker.setMap(null);
                markers.splice(i, 1);
                i--;
            }
        }
    };

    this.setConnected = function (latitude, longitude) {
        _this.addMarker({
            'name': user.name,
            'userName': user.userName,
            'latitude': latitude,
            'longitude': longitude
        });
        sendData(latitude, longitude, user.userName, user.name, 'connected');
    };

    this.setDisconnected = function () {
        _this.deleteMarker({
            'userName': user.userName,
        });
        sendData('', '', user.userName, user.name, 'disconnected');
    };

    function geolocationSuccess(position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        if ((preLatitude != latitude) || (preLongitude != longitude)) {
            _this.setDisconnected();
            _this.setConnected(latitude, longitude);

            preLatitude = latitude;
            preLongitude = longitude;
        }
    }

    function geolocationError(position) {
        growl.error('Error trying to get the geolocation of the user', {
            title: 'Error'
        });
    }

    function sendData(latitude, longitude, userName, name, operation) {
        ws.send(JSON.stringify({
            'section': 'geolocation',
            'data': {
                'operation': operation,
                'name': name,
                'userName': userName,
                'latitude': latitude,
                'longitude': longitude
            }
        }));
    }
}
function MessagesManagement(ws, growl) {
    var messages = {};
    messages.loading = [true];
    messages.list = [];
    var user;

    this.setUser = function (userName, name) {
        user = {
            userName: userName,
            name: name
        };
    };

    this.addMessage = function (data) {
        messages.list.unshift(data);
    };

    this.setLoading = function (progress) {
        messages.loading[0] = progress;
    };

    this.getMessages = function () {
        return messages.list;
    };

    this.isLoading = function () {
        return messages.loading;
    };

    this.sendMessage = function (text) {
        sendData(text);
    };

    this.showError = function (message) {
        growl.error(message, {
            title: 'Error'
        });
    };

    this.sendFile = function (file, operation) {
        var fr = new FileReader();
        fr.onloadend = function () {
            ws.send(JSON.stringify({
                'section': 'messages',
                'data': {
                    'operation': operation,
                    'name': user.name,
                    'userName': user.userName,
                    'binary': fr.result,
                    'name': file.name,
                }
            }));
        };
        fr.readAsDataURL(file);
    };

    function sendData(text) {
        ws.send(JSON.stringify({
            'section': 'messages',
            'data': {
                'operation': 'text',
                'name': user.name,
                'userName': user.userName,
                'text': text
            }
        }));
    }
}
function PeopleManagement(ws, growl) {
    var people = {};
    people.loading = [true];
    people.list = [];
    var user;

    this.addPerson = function (data) {
        people.list.push(data);
        if (user.userName != data.userName) {
            growl.info('User connected: ' + data.name, {
                title: 'Info',
            });
        }
    };

    this.getPeople = function () {
        return people.list;
    };

    this.deletePerson = function (data) {
        for (var i = 0; i < people.list.length; i++) {
            if (people.list[i].userName == data.userName) {
                growl.info('User disconnected: ' + data.name, {
                    title: 'Info',
                });
                people.list.splice(i, 1);
                i--;
            }
        }
    };

    this.setLoading = function (progress) {
        people.loading[0] = progress;
    };

    this.isLoading = function () {
        return people.loading;
    };

    this.setConnected = function (userName, name) {
        user = { //local user
            'userName': userName,
            'name': name
        };
        this.addPerson(user);
        sendData(userName, name, 'connected');
    };

    this.setDisconnected = function () {
        this.deletePerson(user);
        sendData(user.userName, user.name, 'disconnected');
    };

    function sendData(userName, name, operation) {
        ws.send(JSON.stringify({
            'section': 'people',
            'data': {
                'operation': operation,
                'name': name,
                'userName': userName}
        }));
    }
}
function PresentationManagement(ws, growl) {
    var iframe = document.getElementById('iframe');
    var reveal;
    var user;

    iframe.onload = function () {
        reveal = iframe.contentWindow.Reveal;
        reveal.addEventListener('slidechanged', updateOthers);
    };

    function updateOthers(event) {
        sendData(event.indexh, event.indexv);
    }

    this.updateSlide = function (data) { //from the outside
        reveal.removeEventListener('slidechanged', updateOthers);
        reveal.slide(data.indexh, data.indexv);
        reveal.addEventListener('slidechanged', updateOthers);
    };

    this.setUser = function (userName, name) {
        user = {
            userName: userName,
            name: name
        };
    };

    function sendData(indexh, indexv) {
        ws.send(JSON.stringify({
            'section': 'presentation',
            'data': {
                'indexh': indexh,
                'indexv': indexv,
                'userName': user.userName
            }
        }));
    }
}
function RadioManagement(ws, growl) {
    var radio = document.getElementById('radioId');
    var source = document.getElementById('radioSource');

    source.onerror = function () {
        growl.error('The URL provided is not a valid radio', {
            title: 'Error'
        });
    };
}
function StreamingManagement(ws, growl) {
    var streaming = document.getElementById('streamingId');
    var source = document.getElementById('streamingSource');

    source.onerror = function () {
        growl.error('The URL provided is not a valid non-adaptative streaming video', {
            title: 'Error'
        });
    };
}
function VideoconferenceManagement(ws, growl) {
    var constraints = { //interested in video & audio
        audio: true,
        video: true
    };
    var videoLocal = document.getElementById("videoconferenceLocal");
    var area = document.getElementById("videoconferenceArea");
    var loading = [true, true]; //server & video
    var muted = false; //by default, it is not muted
    var disabled = false; //by default, it is not disabled
    var user; //the local user
    var theStream; //to save the reference of the stream
    var peerConnections = []; //at the beginning, there are no connections
    var remotes = []; //remote multimedia stuff

    start();

    videoLocal.onloadeddata = function () {
        loading[1] = false;
        adjustSize();
    };

    window.onresize = function () {
        adjustSize();
    };

    function adjustSize() {
        videoLocal.width = area.offsetWidth / 2.1;
        videoLocal.height = area.offsetWidth / 2.1;
        remotes.forEach(function (remote) {
            remote.video.width = area.offsetWidth / 2.1;
            remote.video.height = area.offsetWidth / 2.1;
        });
    }

    function start() {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(successCallback)
            .catch(errorCallback);
    }

    function successCallback(stream) {
        theStream = stream;
        //converting a MediaStream to a blob URL
        videoLocal.src = window.URL.createObjectURL(stream);
        videoLocal.play();
        videoLocal.muted = true;
        sendData('login');
    }

    function errorCallback(err) {
        videoLocal.setAttribute('poster', 'images/videoconference.png');
        growl.error('The videoconference is not available', {title: 'Error'});
    }

    this.setUser = function (userName, name) {
        user = {
            userName: userName,
            name: name
        };
    };

    this.setMuted = function (mute) {
        muted = mute;
        if (muted) { //mute myself
            theStream.getAudioTracks()[0].enabled = false;
        } else {
            theStream.getAudioTracks()[0].enabled = true;
        }
        remotes.forEach(function (remote) { //mute others
            remote.video.muted = mute;
        });
    };

    this.isMuted = function () {
        return muted;
    };

    this.setDisabled = function (disable) {
        disabled = disable;
        if (disabled) {
            if (theStream != null) {
                videoLocal.pause();
                theStream.getTracks().forEach(function (track) {
                    track.stop();
                });
                this.setDisconnected();
                growl.info('The videoconference has been disabled', {
                    title: 'Info'
                });
            }
        } else {
            start();
            growl.info('The videoconference has been enabled', {
                title: 'Info'
            });
        }

    };

    this.isDisabled = function () {
        return disabled;
    };

    this.setLoading = function (progress) {
        loading[0] = progress;
    };

    this.isLoading = function () {
        return loading;
    };

    function startingCallCommunication() {
        if (typeof RTCPeerConnection == "undefined")
            RTCPeerConnection = webkitRTCPeerConnection;

        //This is an optional configuration string, associated with NAT traversal
        var configuration = {
            "iceServers": [{
                "urls": "turn:numb.viagenie.ca:3478",
                "username": "uo234549@uniovi.es",
                "credential": "joseantonio"
            }]
        };
        var configuration;

        var localPeerConnection = new RTCPeerConnection(configuration);

        //Add the local stream (as returned by getUserMedia() to the local PeerConnection
        localPeerConnection.addStream(theStream);
        //Add a handler associated with ICE protocol events
        // Handler to be called whenever a new local ICE candidate becomes available
        localPeerConnection.onicecandidate = function (event) {
            if (event.candidate) {
                sendCandidate(event.candidate, getUserName(localPeerConnection));
            }
        };

        //...and a second handler to be activated as soon as the remote stream becomes available
        // Handler to be called as soon as the remote stream becomes available
        localPeerConnection.onaddstream = function gotRemoteStream(event) {
            var videoRemote = document.createElement("VIDEO");
            //Associate the remote video element with the retrieved stream
            videoRemote.src = window.URL.createObjectURL(event.stream);
            videoRemote.className = 'videoRemote';
            videoRemote.play();
            videoRemote.muted = false;
            remotes.push({
                'userName': getUserName(localPeerConnection), //the other userName
                'video': videoRemote
            });
            adjustSize();
            area.appendChild(videoRemote);
        };
        return localPeerConnection;
    }

    function getUserName(localPeerConnection) {
        for (var i = 0; i < peerConnections.length; i++) {
            if (peerConnections[i].connection == localPeerConnection) {
                return peerConnections[i].userName;
            }
        }
    }

    this.getMessage = function (data) {
        switch (data.operation) {
            case 'login':
                data.others.forEach(function (user) {
                    //we're all set! Create an Offer to be 'sent' to the callee as soon
                    // as the local SDP is ready
                    var localPeerConnection = startingCallCommunication();

                    //Handler to be called when the 'local' SDP becomes available
                    localPeerConnection.createOffer(
                        function gotLocalDescription(description) {
                            sendOffer(description, user);
                            localPeerConnection.setLocalDescription(description);
                        },
                        function onSignalingError(err) {
                            console.err('Failed to create signaling message: ' + err.message);
                        });
                    peerConnections.push({
                        'userName': user, //the other user
                        'connection': localPeerConnection
                    });
                });
                break;
            case 'offer':
                onOffer(data.offer, data.sourceUserName);
                break;
            case 'answer':
                onAnswer(data.answer, data.targetUserName);
                break;
            case 'candidate':
                onCandidate(data.candidate, data.userName);
                break;
            case 'leave':
                onLeave(data.userName);
                break;
            default:
                break;
        }
    };

    function onOffer(offer, sourceUserName) {
        var localPeerConnection = startingCallCommunication();
        peerConnections.push({
            'userName': sourceUserName, //the other user
            'connection': localPeerConnection
        });
        localPeerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        localPeerConnection.createAnswer(function (answer) {
            localPeerConnection.setLocalDescription(answer);
            sendAnswer(answer, sourceUserName);
        }, function (err) {
            console.error(err);
        });
    }

    function onAnswer(answer, targetUserName) {
        peerConnections.forEach(function (peer) {
            if (peer.userName == targetUserName) {
                peer.connection.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });
    }

    function onCandidate(candidate, userName) {
        peerConnections.forEach(function (peer) {
            if (peer.userName == userName) {
                peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });
    }

    function onLeave(userName) {
        for (var i = 0; i < peerConnections.length; i++) {
            if (peerConnections[i].userName == userName) {
                peerConnections[i].connection.close();
                peerConnections.splice(i, 1);
                i--;
            }
        }

        for (var i = 0; i < remotes.length; i++) {
            if (remotes[i].userName == userName) {
                area.removeChild(remotes[i].video);
                remotes.splice(i, 1);
                i--;
            }
        }
    }

    this.setDisconnected = function () {
        sendData('leave');
        for (var i = 0; i < peerConnections.length; i++) {
            peerConnections[i].connection.close();
            peerConnections.splice(i, 1);
            i--;
        }
        for (var i = 0; i < remotes.length; i++) {
            area.removeChild(remotes[i].video);
            remotes.splice(i, 1);
            i--;
        }
    };

    function sendData(operation) {
        ws.send(JSON.stringify({
            'section': 'videoconference',
            'data': {
                'operation': operation,
                'userName': user.userName,
            }
        }));
    }

    function sendOffer(description, targetUserName) {
        ws.send(JSON.stringify({
            'section': 'videoconference',
            'data': {
                'operation': 'offer',
                'sourceUserName': user.userName,
                'targetUserName': targetUserName,
                'offer': description
            }
        }));
    }

    function sendAnswer(answer, sourceUserName) {
        ws.send(JSON.stringify({
            'section': 'videoconference',
            'data': {
                'operation': 'answer',
                'sourceUserName': sourceUserName,
                'targetUserName': user.userName,
                'answer': answer
            }
        }));
    }

    function sendCandidate(candidate, otherUserName) {
        ws.send(JSON.stringify({
            'section': 'videoconference',
            'data': {
                'operation': 'candidate',
                'userName': user.userName,
                'otherUserName': otherUserName,
                'candidate': candidate
            }
        }));
    }
}
function VideoManagement(ws, growl) {
    var muted = false;
    var video = document.getElementById('videoId');
    var source = document.getElementById('videoSource');

    source.onerror = function () {
        growl.error('The URL provided is not a valid video', {
            title: 'Error'
        });
    };

    this.setMuted = function (mute) {
        muted = mute;
    };

    this.isMuted = function () {
        return muted;
    };

    this.playVideo = function (url) {
        sendData(url);
    };

    this.updateVideoUrl = function (url) {
        if (!muted) {
            source.src = url;
            video.load();
            video.play();
        }
    };

    function sendData(url) {
        ws.send(JSON.stringify({
            'section': 'video',
            'data': {
                'url': url,
            }
        }));
    }
}