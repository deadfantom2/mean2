//userServices se connecte a userControllers
angular.module('userControllers', ['userServices'])

.controller('regCtrl', function ($http, $location, $timeout, User) {

    var app = this;

    app.regUser = function (regData, valid) {
        app.loading = true;       // son etat initiale a true c'est a dire present
        app.successMsg = false;   // annulle ou cache le message success apres avoir appuer 2eme fois sur le bouton
        app.errorMsg = false;     // annulle ou cache le message error apres apuit sur le bouton 2eme fois
      console.log('form submitted');
     // console.log(this.regData);
        if(valid){
            User.create(app.regData).then(function (datas) {  // executer la methode qui se trouve dans userServices.js
                //console.log(datas.data.success); //on parcours et filtre json log en accedant dans data et apres success
                //console.log(datas.data.message); //on parcours et filtre json log en accedant dans data et apres message
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
        app.checkingUsername = true;
        app.usernameMsg = false;
        app.usernameInvalid = false;
        User.checkUsername(app.regData).then(function (datas) {
            if(datas.data.success){
                app.checkingUsername = false;
                app.usernameInvalid = false;
                app.usernameMsg = datas.data.message;
            }else{
                app.checkingUsername = false;
                app.usernameInvalid = true;
                app.usernameMsg = datas.data.message;
            }
        });
    }


    //User.checkEmail(regData);
    this.checkEmail = function (regData) {
        app.checkingEmail = true;
        app.emailMsg = false;
        app.emailInvalid = false;
        User.checkEmail(app.regData).then(function (datas) {
            if(datas.data.success){
                app.checkingEmail = false;
                app.emailInvalid = false;
                app.emailMsg = datas.data.message;
            }else{
                app.checkingEmail = false;
                app.emailInvalid = true;
                app.emailMsg = datas.data.message;
            }
        });
    }
})


// verifier les mot de passe si ils ont bn
.directive('match', function () {
    return {
        restrict : 'A', //A = All metch attributs name
        controller: function ($scope) {
            $scope.confirmed = false;

            $scope.doConfirm = function (values) {
                values.forEach(function (ele) {

                    if($scope.confirm == ele){
                        $scope.confirmed = true;
                    }else{
                        $scope.confirmed = false;
                    }
                });
            }
        },
        link: function (scope, element, attrs) {
            attrs.$observe('match', function () {
                scope.matches = JSON.parse(attrs.match);
                scope.doConfirm(scope.matches);
            });
            scope.$watch('confirm', function () {
                scope.matches = JSON.parse(attrs.match);
                scope.doConfirm(scope.matches);
            });
        }
    };
});

