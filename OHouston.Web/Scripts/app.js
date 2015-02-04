(function () {
    "use strict";
    var app = angular.module('xPlat', ['ui.router', 'ngAnimate']);
    app.config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider.
            state('home', { url: '/home', templateUrl: '/partials/index.html', controller: 'HomeCtrl' }).
            state('menu', { url: '/menu', templateUrl: '/partials/Menu.html', controller: 'MenuCtrl' }).
            state('login', { url: '/login', templateUrl: '/partials/login.html', controller: 'LoginCtrl' }).
            state('register', { url: '/register', templateUrl: '/partials/register.html', controller: 'RegisterCtrl' }).
            state('welcome', { url: '/welcome', templateUrl: '/partials/main/index.html', controller: 'WelcomeCtrl' });

        $urlRouterProvider.otherwise('/home');
    });
    app.directive("fileread", [function () {
        return {
            scope: {
                fileread: "="
            },
            link: function (scope, element, attributes) {
                element.bind("change", function (changeEvent) {
                    scope.$apply(function () {
                        scope.fileread = changeEvent.target.files[0];
                        // or all selected files:
                        // scope.fileread = changeEvent.target.files;
                    });
                });
            }
        }
    }]);
    app.directive('ngTextChange', function () {
        return {
            restrict: 'A',
            replace: 'ngModel',
            link: function (scope, element, attr) {
                element.on('change', function () {
                    scope.$apply(function () {
                        scope.$eval(attr.ngTextChange);
                    });
                });
            }
        };
    });

    app.factory('dataAccess',
        function ($http) {
            function register(data, onSuccess, onFailure) {
                $http.post('/api/Account/Register',
                data)
                .then(onSuccess, onFailure);
            };
            function login(username, password, onSuccess, onFailure) {
                $http.post('/Token',
                "userName=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password) + "&grant_type=password", { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
                .then(onSuccess, onFailure);
            };
            return {
                register: function (data, onSuccess, onFailure) { return register(data, onSuccess, onFailure); },
                login: function (username, password, onSuccess, onFailure) { return login(username, password, onSuccess, onFailure); }
            };
        });


    app.service('oHoustonSvc', function ($http, dataAccess) {
        var self = this; // Save reference

        this.guid = function () {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        };

        this.token = null;
        this.username = null;
        this.getUsername = function () {
            self.username = localStorage.getItem('username');
            return self.username;
        };
        this.getToken = function () {
            self.token = localStorage.getItem('accessToken');
            return self.token;
        }
        this.setToken = function (data) {
            if (!data || !data.token) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('username');
                self.notifyOfOHoustonStatusChange();
                return null;
            } else {
                $http.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
                localStorage.setItem('username', data.username);
                var result = localStorage.setItem('accessToken', data.token);
                self.notifyOfOHoustonStatusChange();
                return result;
            }
        };
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + self.getToken();


        this.oHoustonStatusChangeCallbacks = {};
        this.awaitOHoustonStatusChange = function (key, callback) { self.oHoustonStatusChangeCallbacks[key] = callback; };
        this.notifyOfOHoustonStatusChange = function () {
            $.each(self.oHoustonStatusChangeCallbacks, function (i, callback) {
                callback();
            });
            return self.getUsername();
        };
        this.messageConnectionStatus = 'not started';
        //self.notifyOfOHoustonStatusChange();

        this.logoff = function () {
            self.setToken(false);
        };

    });

    app.controller('MenuCtrl', function ($scope, $state, oHoustonSvc, dataAccess) {
        $scope.username = oHoustonSvc.getUsername();
        oHoustonSvc.awaitOHoustonStatusChange('MenuCtrl', function () {
            $scope.username = oHoustonSvc.getUsername();
        });

        $scope.logoff = function () {
            oHoustonSvc.logoff();
            $state.go('home');
        };
    });
    app.controller('HomeCtrl', function ($scope, $location, $stateParams, oHoustonSvc, dataAccess) {


    });
    app.controller('LoginCtrl', function ($scope, $state, oHoustonSvc, dataAccess) {
        $scope.loginInProcess = false;
        $scope.doLogin = function () {
            $scope.loginInProcess = true;
            dataAccess.login($scope.loginUsername, $scope.loginPassword,
                function (r) {
                    $scope.loginInProcess = false;
                    oHoustonSvc.setToken({ token: r.data.access_token, username: $scope.loginUsername });
                    $state.go('welcome');
                },
                function (r) {
                    $scope.loginInProcess = false;
                    alert('invalid username or password');
                    console.log(r);
                });
        };
    });
    app.controller('RegisterCtrl', function ($scope, $state, $timeout,  oHoustonSvc, dataAccess) {
        $scope.registerInProcess = false;
        $scope.registerComplete = false;
        $scope.doRegister = function () {
            $scope.registerInProcess = true;
            dataAccess.register({
                Username: $scope.registerUsername,
                Email: $scope.registerEmail,
                Password: $scope.registerPassword,
                ConfirmPassword: $scope.registerPassword2
            }, function (result) {
                dataAccess.login($scope.registerUsername, $scope.registerPassword,
                    function (r) {
                        oHoustonSvc.setToken({ token: r.data.access_token, username: $scope.registerUsername });
                        $state.go('welcome');
                        $scope.registerComplete = true;
                        $scope.registerInProcess = false;
                    },
                    function (r) {
                        $scope.registerComplete = true;
                        $scope.registerInProcess = false;
                        console.log('Register succeeded. Login failed.');
                        console.log(r);
                    });
            }, function (result) {
                $scope.registerInProcess = false;
                console.log(result);
                if (result.data.Message) {
                    alert(result.data.Message);
                } else {
                    alert('something went wrong registering :(');
                }
            });
        };

    });

    app.controller('WelcomeCtrl', function ($scope, $location, $stateParams, oHoustonSvc, dataAccess) {

    });
})();