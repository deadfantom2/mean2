//userServices se connecte a userControllers
angular.module('userControllers', ['userServices'])

.controller('regCtrl', function ($http, $location, $timeout, User) {

    var app = this;

    // Custom function that registers the user in the database
    app.regUser = function (regData, valid) {
        app.loading = true;       // son etat initiale a true c'est a dire present
        app.successMsg = false;   // annulle ou cache le message success apres avoir appuer 2eme fois sur le bouton
        app.errorMsg = false;     // annulle ou cache le message error apres apuit sur le bouton 2eme fois
      console.log('form submitted');
     // console.log(this.regData);
        // If form is valid and passwords match, attempt to create user
        if(valid){
            // Runs custom function that registers the user in the database
            User.create(app.regData).then(function (datas) {  // executer la methode qui se trouve dans userServices.js
                //console.log(datas.data.success); //on parcours et filtre json log en accedant dans data et apres success
                //console.log(datas.data.message); //on parcours et filtre json log en accedant dans data et apres message
                // Check if user was saved to database successfully
                if(datas.data.success){
                    app.loading = false;   // son etat initiale a true apparait et on la cache avec l'etat false
                    app.successMsg = datas.data.message + '...Redirecting...';   // creer success message, si on met this.successMsg ca n'aparaitra pas dans la vue

                    $timeout(function () {  // angular method timeout 2ms
                        $location.path('/');  // angular methode redirect location.path
                    }, 2000); // on stop le redirect pendant 2 ms
                }else{
                    app.loading = false;   // son etat initiale a true apparait et on la cache avec l'etat false
                    app.errorMsg = datas.data.message;   // creer error message
                }
            });
        }else{
            app.loading = false;   // son etat initiale a true apparait et on la cache avec l'etat false
            app.errorMsg = 'Please ensure form is filled our properly';   // creer error message
        }
    };

    // User.checkUsername(regData);
    this.checkUsername = function (regData) {
        app.checkingUsername = true; // Start bootstrap loading icon
        app.usernameMsg = false; // Clear usernameMsg each time user activates ngBlur
        app.usernameInvalid = false; // Clear usernameInvalid each time user activates ngBlur
        // Runs custom function that checks if username is available for user to use
        User.checkUsername(app.regData).then(function (datas) {
            // Check if username is available for the user
            if(datas.data.success){
                app.checkingUsername = false; // Stop bootstrap loading icon
                app.usernameInvalid = false;
                app.usernameMsg = datas.data.message; // If successful, grab message from JSON object
            }else{
                app.checkingUsername = false; // Stop bootstrap loading icon
                app.usernameInvalid = true; // User variable to let user know that the chosen username is taken already
                app.usernameMsg = datas.data.message; // If not successful, grab message from JSON object
            }
        });
    }


    // Custom function that checks if e-mail is available for user to use
    this.checkEmail = function (regData) {
        app.checkingEmail = true; // Start bootstrap loading icon
        app.emailMsg = false; // Clear emailMsg each time user activates ngBlur
        app.emailInvalid = false; // Clear emailInvalid each time user activates ngBlur
        // Runs custom function that checks if e-mail is available for user to use
        User.checkEmail(app.regData).then(function (datas) {
            // Check if e-mail is available for the user
            if(datas.data.success){
                app.checkingEmail = false; // Stop bootstrap loading icon
                app.emailInvalid = false;
                app.emailMsg = datas.data.message; // If successful, grab message from JSON object
            }else{
                app.checkingEmail = false; // Stop bootstrap loading icon
                app.emailInvalid = true; // User variable to let user know that the chosen e-mail is taken already
                app.emailMsg = datas.data.message; // If not successful, grab message from JSON object
            }
        });
    }
})


// Custom directive to check matching passwords
.directive('match', function () {
    return {
        restrict : 'A', //A = All metch attributs name
        controller: function ($scope) {
            $scope.confirmed = false; // Set matching password to false by default
            // Custom function that checks both inputs against each other
            $scope.doConfirm = function (values) {
                // Run as a loop to continue check for each value each time key is pressed
                values.forEach(function (ele) {
                    // Check if inputs match and set variable in $scope
                    if($scope.confirm == ele){
                        $scope.confirmed = true; // If inputs match
                    }else{
                        $scope.confirmed = false; // If inputs do not match
                    }
                });
            }
        },
        link: function (scope, element, attrs) {
            // Grab the attribute and observe it
            attrs.$observe('match', function () {
                scope.matches = JSON.parse(attrs.match); // Parse to JSON
                scope.doConfirm(scope.matches); // Run custom function that checks both inputs against each other
            });
            // Grab confirm ng-model and watch it
            scope.$watch('confirm', function () {
                scope.matches = JSON.parse(attrs.match); // Parse to JSON
                scope.doConfirm(scope.matches); // Run custom function that checks both inputs against each other
            });
        }
    };
});

