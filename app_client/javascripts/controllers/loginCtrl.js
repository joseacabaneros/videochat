angular.module('multichatApp')
    .controller('loginCtrl', function ($scope, $http, $window, $cookies, vcRecaptchaService) {
        $scope.response = null;
        $scope.widgetId = null;

        $scope.model = {
            key: '6LdYVBoUAAAAAOXzOS1UIOeRrvHZLOD7pgxOoluc'
        };

        $scope.setResponse = function (response) {
            console.info('Response available');

            $scope.response = response;
        };

        $scope.setWidgetId = function (widgetId) {
            console.info('Created widget ID: %s', widgetId);

            $scope.widgetId = widgetId;
        };

        $scope.cbExpiration = function() {
            console.info('Captcha expired. Resetting response object');

            vcRecaptchaService.reload($scope.widgetId);

            $scope.response = null;
        };

        $scope.data = {};
        $scope.data.errorShow = false;
        $scope.data.userNotValid = false;

        $scope.submit = function (login) {

            console.log('Success');
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
    });