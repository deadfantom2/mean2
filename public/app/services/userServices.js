angular.module('userServices', ['ngRoute'])

    .factory('User', function ($http) {
        var userFactory = {}; // Create the userFactory object

        // Register users in database
        userFactory.create = function (regData) {
            return $http.post('/api/users', regData); // executer la methode qui se trouve dans app/routes/api.js
        }


        // Check if username is available at registration
        userFactory.checkUsername = function (regData) {
            return $http.post('/api/checkusername', regData); // executer la methode qui se trouve dans app/routes/api.js
        }

        // Check if e-mail is available at registration
        userFactory.checkEmail = function (regData) {
            return $http.post('/api/checkemail', regData); // executer la methode qui se trouve dans app/routes/api.js
        }

        // Get the current user's permission
        userFactory.getPermission = function () {
            return $http.get('/api/permission/');
        };

        // Get all the users from database
        userFactory.getUsers = function () {
          return $http.get('/api/management/');
        };

        // Get user to then edit
        userFactory.getUser = function (id) {
          return $http.get('/api/edit/' + id);
        };

        // Delete a user
        userFactory.deleteUser = function (username) {
            return $http.delete('/api/management/' + username);
        };

        // Edit a user
        userFactory.editUser = function (username) {
            return $http.put('/api/edit/', username);
        };
        
        return userFactory;  // Return userFactory object
});