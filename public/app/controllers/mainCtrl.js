//authServices se connecte a mainController
angular.module('mainController', ['authServices'])   //authServices contient  method login

// Controller: mainCtrl is used to handle login and main index functions (stuff that should run on every page)
.controller('mainCtrl', function (Auth, $location, $timeout, $rootScope, User) { //Auth est declarer dans authServices factory
    var app = this;

    app.loadme = false; // Hide main HTML until data is obtained in AngularJS

    $rootScope.$on('$routeChangeStart', function () { // a chaque fois qu'on changer les routes il prenne en compte la fonction
        // Check if user is logged in
        if(Auth.isLoggedIn()){
            console.log('Success User is logged in');
            app.isLoggedIn = true; // Variable to active ng-show on index
            // Custom function to retrieve user data
            Auth.getUser().then(function (datas) { // getUser se trouve dans authServices
                //console.log(datas);
                console.log(datas.data.username);
                app.username = datas.data.username; // Get the user name for use in index
                app.email = datas.data.email;

                // traiement selon les permission si on est admin ou moderator afficher button si non  cacher button "management"
                User.getPermission().then(function (datas) {
                   if(datas.data.permission == 'admin' || datas.data.permission == 'moderator'){
                       app.authorized = true; // Set user's current permission to allow management
                       app.loadme = true; // Show main HTML now that data is obtained in AngularJS
                   }else{
                       app.loadme = true;
                   }
                });
                app.loadme = true;
            });
        }else{
            console.log('Failure user is not logged in');
            app.isLoggedIn = false; // User is not logged in, set variable to falses
            app.username = ''; // apres avoir deconnecter on vide la ariable username
            app.loadme = true; // Show main HTML now that data is obtained in AngularJS
        }
    });



    // Function that performs login
    app.doLogin = function (loginData) {
        app.loading = true;       // son etat initiale a true c'est a dire present
        app.successMsg = false;   // annulle ou cache le message success apres avoir appuer 2eme fois sur le bouton
        app.errorMsg = false;     // annulle ou cache le message error apres apuit sur le bouton 2eme fois
        console.log('form submitted');
        // Function that performs login
        Auth.login(app.loginData).then(function (datas) {  // executer la methode qui se trouve dans authServices.js
            //console.log(datas.data.success); //on parcours et filtre json log en accedant dans data et apres success
            //console.log(datas.data.message); //on parcours et filtre json log en accedant dans data et apres message
            // Check if login was successful
            if(datas.data.success){
                app.loading = false;   // Stop bootstrap loading icon
                app.successMsg = datas.data.message + '...Redirecting...';   // Create Success Message then redirect
                // Redirect to home page after two milliseconds (2 seconds)
                $timeout(function () {  // angular method timeout 2ms
                    $location.path('/about');  // angular methode redirect location.path
                    app.loginData = ''; // Clear login form
                    app.successMsg = false; // CLear success message
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
