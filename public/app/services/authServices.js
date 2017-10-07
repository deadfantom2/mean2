angular.module('authServices', ['ngRoute'])

    .factory('Auth', function ($http, AuthToken) {
        var authFactory = {};

        // Auth.authenticate(loginData)
        authFactory.login = function (loginData) {
            return $http.post('/api/authenticate', loginData).then(function (datas) { // executer la methode qui se trouve dans app/routes/api.js
                AuthToken.setToken(datas.data.token);
                return datas;
            });
        };

        // Auth.isLoggedIn();
        authFactory.isLoggedIn = function () {
            if(AuthToken.getToken()){
                return true;
            }else{
                return false;
            }
        };

        // Auth.getUser();
        authFactory.getUser = function () {
            if(AuthToken.getToken()){
                return $http.post('/api/me');
            }else{
                $q.reject({ message : 'User has no token'});
            }
        };

        // Auth.logout();
        authFactory.logout = function () {
            AuthToken.setToken();
        };
        return authFactory;  //returner la methode complete
    })

    .factory('AuthToken', function ($window) {
        var authTokenFactory = {};

        // AuthToken.setToken(token);
        authTokenFactory.setToken = function (token) {
            if(token){
                $window.localStorage.setItem('token', token);
            }else{
                $window.localStorage.removeItem('token');
            }
        };
        // AuthToken.getToken(token);
        authTokenFactory.getToken = function () {
            return $window.localStorage.getItem('token');
        };
        return authTokenFactory;
    })

    .factory('AuthInterceptors', function (AuthToken) {   // attache token pour toutes les requeste
        var authInterceptorsFactory = {};

        authInterceptorsFactory.request = function (config) {
            var token = AuthToken.getToken();

            if(token) config.headers['x-access-token'] = token;

            return config;
        };

        return authInterceptorsFactory;
    });
