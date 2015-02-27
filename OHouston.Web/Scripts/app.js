(function () {
    "use strict";
    var version = '?v=' + $("#Version").val();
    var app = angular.module('xPlat', ['ui.router', 'ngAnimate']);
    app.config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider.
            state('home', { url: '/home', templateUrl: '/partials/index.html' + version, controller: 'HomeCtrl' }).
            state('menu', { url: '/menu', templateUrl: '/partials/Menu.html' + version, controller: 'MenuCtrl' }).
            state('login', { url: '/login', templateUrl: '/partials/login.html' + version, controller: 'LoginCtrl' }).
            state('register', { url: '/register', templateUrl: '/partials/register.html' + version, controller: 'RegisterCtrl' }).
            state('welcome', { url: '/welcome', templateUrl: '/partials/main/index.html' + version, controller: 'WelcomeCtrl' });

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

    app.directive('gbModelState', function () {
        return {
            restrict: 'AE',
            scope: {
                key: '@',
                datamodel: '=',
                form: '='
            },
            templateUrl: '/partials/misc/ModelState.html'
        }
    });

    app.filter('camelCaseToHuman', function () {
        return function (input) {
            return input.charAt(0).toUpperCase() + input.substr(1).replace(/[A-Z]/g, ' $&');
        }
    });

    app.factory('dataAccess',
        function ($http) {
            function register(data, onSuccess, onFailure) {
                $http.post('/api/Account/Register',
                data)
                .then(onSuccess, onFailure);
            };
            function login(data, onSuccess, onFailure) {
                var username = data.Username;
                var password = data.Password;
                $http.post('/Token',
                "userName=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password) + "&grant_type=password", { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
                .then(onSuccess, onFailure);
            };
            return {
                register: function (data, onSuccess, onFailure) { return register(data, onSuccess, onFailure); },
                login: function (data, onSuccess, onFailure) { return login(data, onSuccess, onFailure); }
            };
        });


    app.service('oHoustonSvc', function ($http, $state, dataAccess) {
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
        this.init = function () {
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
                self.wipe();
            };
        };


        this.wipe = function () {
            localStorage.clear();
            self.notifyOfOHoustonStatusChange();
            self.init();
        };



        this.init();
    });

    app.controller('MenuCtrl', function ($scope, $state, oHoustonSvc, dataAccess) {
        $scope.username = oHoustonSvc.getUsername();
        oHoustonSvc.awaitOHoustonStatusChange('MenuCtrl', function () {
            $scope.username = oHoustonSvc.getUsername();
        });

        $scope.logoff = function () {
            oHoustonSvc.logoff();
            $state.go('login');
        };
    });
    app.controller('HomeCtrl', function ($scope, $location, $stateParams, oHoustonSvc, dataAccess) {


    });
    app.controller('LoginCtrl', function ($scope, $state, oHoustonSvc, dataAccess) {
        $scope.loginInProcess = false;
        $scope.loginFormModel = {};
        $scope.doLogin = function () {
            $scope.loginInProcess = true;
            if ($scope.loginFormModel.Username && $scope.loginFormModel.Username.length >= 0 && $scope.loginFormModel.Password && $scope.loginFormModel.Password.length >= 8) {

                dataAccess.login($scope.loginFormModel,
                    function (r) {
                        $scope.loginInProcess = false;
                        oHoustonSvc.setToken({ token: r.data.access_token, username: $scope.loginFormModel.Username });
                        $state.go('welcome');
                    },
                    function (r) {
                        $scope.loginInProcess = false;
                        $scope.loginForm.Password.$invalid = true;
                        $scope.loginForm.Password.$pristine = false;
                        $scope.loginForm.Password.$valid = false;

                        if (r.data && r.data.error_description) {
                            $scope.loginForm.Password.errors = [r.data.error_description];
                        } else {
                            $scope.loginForm.Password.errors = ['The user name or password is incorrect.'];
                        }
                    });
            } else {
                $scope.loginInProcess = false;
                $scope.loginForm.Password.$invalid = true;
                $scope.loginForm.Password.$pristine = false;
                $scope.loginForm.Password.$valid = false;
                $scope.loginForm.Password.errors = ['"The user name or password is incorrect."'];

            }
        };
    });
    app.controller('RegisterCtrl', function ($scope, $state, $timeout, oHoustonSvc, dataAccess) {

        $scope.registerInProcess = false;
        $scope.registerComplete = false;
        $scope.registerFormModel = {};
        $scope.doRegister = function () {


            $scope.registerInProcess = true;
            if ($scope.registerFormModel.Password && $scope.registerFormModel.Password == $scope.registerFormModel.ConfirmPassword) {

                dataAccess.register($scope.registerFormModel, function (result) {
                    dataAccess.login($scope.registerUsername, $scope.registerPassword,
                        function (r) {
                            oHoustonSvc.setToken({ token: r.data.access_token, username: $scope.registerFormModel.Username });
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
                    if (result.data.ModelState) {
                        $.each(result.data.ModelState, function (k, v) {
                            $scope.registerForm[k].$valid = false;
                            $scope.registerForm[k].$invalid = true;
                            $scope.registerForm[k].errors = v;
                        });
                    } else {
                        alert('something went wrong registering :(');
                    }
                });
            } else {
                $scope.registerInProcess = false;
                $scope.registerForm.Password.$invalid = true;
                $scope.registerForm.Password.$pristine = false;
                $scope.registerForm.Password.$valid = false;
                $scope.registerForm.Password.errors = ['mismatched passwords'];
            }
        };

    });

    app.controller('WelcomeCtrl', function ($scope, $location, $stateParams, oHoustonSvc, dataAccess) {

    });
})();