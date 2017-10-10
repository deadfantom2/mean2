var app = angular.module('appRoutes', ['ngRoute'])

// Configure Routes; 'authenticated = true' means the user must be logged in to access the route
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
    .when('/search', {
        templateUrl: 'app/views/pages/management/search.html',
        controller: 'managementCtrl',
        controllerAs: 'management',   //nickname controller
        authenticated : true, // authenticated sera utiliser dans  le  bas middleware
        permission: ['admin', 'moderator'] //permission que pour admin ou moderator
    })
    .otherwise({ redirectTo: '/' }); // If user tries to access any other route, redirect to home page

    // supprimer # dans le path angular
    $locationProvider.html5Mode({ enabled: true, requireBase: false });

});

//middleware pour n'est pas aller dans les routes login ou register quand on est connecter, et le contraire
app.run(['$rootScope', 'Auth', '$location', 'User', function ($rootScope, Auth, $location, User) {
    // Check each time route changes
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        // Only perform if user visited a route listed above
        if(next.$$route != undefined){
            // Check if authentication is required on route
            if(next.$$route.authenticated == true){ // si on est sur le route(path) /login ou /register
                // Check if authentication is required, then if permission is required
                if(!Auth.isLoggedIn()){ // si n'est pas connecter
                    event.preventDefault(); //
                    $location.path('/'); // rederiction  vers le path /
                }else if(next.$$route.permission){ // si permission est true, dans api.js creer  noew route user permission
                    User.getPermission().then(function (datas) {
                        // Check if user's permission matches at least one in the array
                        if(next.$$route.permission[0] != datas.data.permission){
                            if(next.$$route.permission[1] != datas.data.permission){
                                event.preventDefault(); // If at least one role does not match, prevent accessing route
                                $location.path('/'); // rederiction  vers le path /
                            }
                        }
                    });
                }
            }else if(next.$$route.authenticated == false){ // si on n'est pas sur le route  /login ou /register
                // If authentication is not required, make sure is not logged in
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

