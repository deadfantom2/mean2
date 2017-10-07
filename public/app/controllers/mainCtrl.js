//authServices se connecte a mainController
angular.module('mainController', ['authServices'])   //authServices contient  method login

.controller('mainCtrl', function (Auth, $location, $timeout, $rootScope, User) { //Auth est declarer dans authServices factory
    var app = this;

    app.loadme = false;

    $rootScope.$on('$routeChangeStart', function () { // a chaque fois qu'on changer les routes il prenne en compte la fonction
        if(Auth.isLoggedIn()){
            console.log('Success User is logged in');
            app.isLoggedIn = true;
            Auth.getUser().then(function (datas) { // getUser se trouve dans authServices
                //console.log(datas);
                console.log(datas.data.username);
                app.username = datas.data.username;
                app.email = datas.data.email;

                // traiement selon les permission si on est admin ou moderator afficher button si non  cacher button "management"
                User.getPermission().then(function (datas) {
                   if(datas.data.permission == 'admin' || datas.data.permission == 'moderator'){
                       app.authorized = true;
                       app.loadme = true;
                   }else{
                       app.loadme = true;
                   }
                });


                app.loadme = true;
            });
        }else{
            console.log('Failure user is not logged in');
            app.isLoggedIn = false;
            app.username = ''; // apres avoir deconnecter on vide la ariable username
            app.loadme = true;
        }
    });




    app.doLogin = function (loginData) {
        app.loading = true;       // son etat initiale a true c'est a dire present
        app.successMsg = false;   // annulle ou cache le message success apres avoir appuer 2eme fois sur le bouton
        app.errorMsg = false;     // annulle ou cache le message error apres apuit sur le bouton 2eme fois
        console.log('form submitted');
        Auth.login(app.loginData).then(function (datas) {  // executer la methode qui se trouve dans authServices.js
            //console.log(datas.data.success); //on parcours et filtre json log en accedant dans data et apres success
            //console.log(datas.data.message); //on parcours et filtre json log en accedant dans data et apres message

            if(datas.data.success){
                app.loading = false;   // son etat initiale a true apparait et on la cache avec l'etat false
                app.successMsg = datas.data.message + '...Redirecting...';   // creer success message, si on met this.successMsg ca n'aparaitra pas dans la vue

                $timeout(function () {  // angular method timeout 2ms
                    $location.path('/about');  // angular methode redirect location.path
                    app.loginData = ''; // on vide loginData
                    app.successMsg = false; // on vide msg
                }, 2000); // on stop le redirect pendant 2 ms


            }else{
                app.loading = false;   // son etat initiale a true apparait et on la cache avec l'etat false
                app.errorMsg = datas.data.message;   // creer error message
            }
        });
    };

    this.logout = function () {
        Auth.logout();
        $location.path('/logout');
        $timeout(function () {  // angular method timeout 2ms
            $location.path('/');  // angular methode redirect location.path
        }, 2000); // on stop le redirect pendant 2 ms
    };
});
