(function () {
    var app = angular.module('app', ['ngRoute', 'angular-jwt']);

    app.config(function ($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
        $routeProvider.when('/', {
            templateUrl: './templates/main.html',
            controller: 'MainController',
            controllerAs: 'vm'
        });

        $routeProvider.when('/login', {
            templateUrl: './templates/login.html',
            controller: 'LoginController',
            controllerAs: 'vm'
        });

        $routeProvider.when('/register', {
            templateUrl: './templates/register.html',
            controller: 'RegisterController',
            controllerAs: 'vm'
        });

        $routeProvider.when('/polls', {
            templateUrl: './templates/polls.html',
            controller: 'PollsController',
            controllerAs: 'vm'
        });

        $routeProvider.when('/polls/:id', {
            templateUrl: './templates/poll.html',
            controller: 'PollController',
            controllerAs: 'vm'
        });

        $routeProvider.when('/profile', {
            templateUrl: './templates/profile.html',
            controller: 'ProfileController',
            controllerAs: 'vm'
        });
    });

    app.controller('MainController',MainController);
    function MainController($location,$window){

    }


    app.controller('LoginController',LoginController);
    function LoginController($location,$window){

    }

    app.controller('RegisterController',RegisterController);
    function RegisterController($location,$window){

    }

    app.controller('PollsController',PollsController);
    function PollsController($location,$window){

    }

    app.controller('PollController',PollController);
    function PollController($location,$window){

    }

    app.controller('ProfileController',ProfileController);
    function ProfileController($location,$window){

    }
    
}())