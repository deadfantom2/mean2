angular.module('userApp', ['appRoutes', 'userControllers', 'userServices', 'ngAnimate', 'mainController', 'authServices', 'managementController'])


.config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptors');
});

// dans html userApp in body tag
// appRoutes  se trouve dans routes.js
// userControllers  se trouve dans userCtrl.js
// userServices  se trouve dans userServices.js
// mainController  se trouve dans mainCtrl.js
// authServices  se trouve dans authServices.js
// managementController  se trouve dans managementCtrl.js


//on connect token a toutes les http request