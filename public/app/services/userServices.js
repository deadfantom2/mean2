angular.module('userServices', ['ngRoute'])

    .factory('User', function ($http) {
        var userFactory = {};

        // User.create(regData)
        userFactory.create = function (regData) {
            return $http.post('/api/users', regData); // executer la methode qui se trouve dans app/routes/api.js
        }


        // User.checkUsername(regData)
        userFactory.checkUsername = function (regData) {
            return $http.post('/api/checkusername', regData); // executer la methode qui se trouve dans app/routes/api.js
        }

        // User.checkEmail(regData)
        userFactory.checkEmail = function (regData) {
            return $http.post('/api/checkemail', regData); // executer la methode qui se trouve dans app/routes/api.js
        }

        // get permission se trouve dans mainCtrl
        userFactory.getPermission = function () {
            return $http.get('/api/permission/');
        };

        //recuper listes des utilisateurs
        userFactory.getUsers = function () {
          return $http.get('/api/management/');
        };

        userFactory.getUser = function (id) {
          return $http.get('/api/edit/' + id);
        };

        //supprimer l'utilisateur
        userFactory.deleteUser = function (username) {
            return $http.delete('/api/management/' + username);
        };

        userFactory.editUser = function (username) {
            return $http.put('/api/edit/', username);
        };
        
        return userFactory;  //returner la methode complete
});