var app = angular.module('appRoutes', ['ngRoute'])

.config(function ($routeProvider, $locationProvider) {
    $routeProvider

    .when('/', {
        templateUrl: 'app/views/pages/home.html'
    })
    .when('/about', {
        templateUrl: 'app/views/pages/about.html'
    })
    .when('/register', {
        templateUrl: 'app/views/pages/users/register.html',
        controller: 'regCtrl',
        controllerAs: 'register',   //nickname controller
        authenticated : false
    })
    .when('/login', {
        templateUrl: 'app/views/pages/users/login.html',
        authenticated : false
    })
    .when('/logout', {
        templateUrl: 'app/views/pages/users/logout.html',
        authenticated : true
    })
    .when('/profile', {
        templateUrl: 'app/views/pages/users/profile.html',
        authenticated : true // authenticated sera utiliser dans  le  bas middleware
    })
    .when('/management', {
        templateUrl: 'app/views/pages/management/management.html',
        controller: 'managementCtrl',
        controllerAs: 'management',   //nickname controller
        authenticated : true, // authenticated sera utiliser dans  le  bas middleware
        permission: ['admin', 'moderator'] //permission que pour admin ou moderator
    })
    .when('/edit/:id', {
        templateUrl: 'app/views/pages/management/edit.html',
        controller: 'editCtrl',
        controllerAs: 'edit',   //nickname controller
        authenticated : true, // authenticated sera utiliser dans  le  bas middleware
        permission: ['admin', 'moderator'] //permission que pour admin ou moderator
    })
    .otherwise({ redirectTo: '/'}); //si on ecrit plus de texte dans les path on redirige vers /

    // supprimer # dans le path angular
    $locationProvider.html5Mode({ enabled: true, requireBase: false });


});

//middleware pour n'est pas aller dans les routes login ou register quand on est connecter, et le contraire
app.run(['$rootScope', 'Auth', '$location', 'User', function ($rootScope, Auth, $location, User) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {

        if(next.$$route != undefined){ // i tous sauf la page undefined executer code a linterieur

            if(next.$$route.authenticated == true){ // si on est sur le route(path) /login ou /register
                if(!Auth.isLoggedIn()){ // si n'est pas connecter
                    event.preventDefault(); //
                    $location.path('/'); // rederiction  vers le path /
                }else if(next.$$route.permission){ // si permission est true, dans api.js creer  noew route user permission
                    User.getPermission().then(function (datas) {
                        if(next.$$route.permission[0] != datas.data.permission){
                            if(next.$$route.permission[1] != datas.data.permission){
                                event.preventDefault(); //
                                $location.path('/'); // rederiction  vers le path /
                            }
                        }
                    });
                }
            }else if(next.$$route.authenticated == false){ // si on n'est pas sur le route  /login ou /register
                if(Auth.isLoggedIn()){ // si on est connecter
                    event.preventDefault();
                    $location.path('/profile'); //rederection /profile
                }
            }else{
                console.log('auth does not matter');
            }


        }

    });
}]);

