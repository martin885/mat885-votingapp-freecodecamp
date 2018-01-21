(function () {
    var app = angular.module('app', ["ngRoute", "angular-jwt"]);


    app.run(function ($http, $rootScope, $location, $window) {

        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.localStorage.token;
        $rootScope.$on('$routeChangeStart', function (event, nextRoute, currentRoute) {



            if (nextRoute.access !== undefined && nextRoute.access.restricted === true && !$window.localStorage.token) {
                event.preventDefault();
                $location.path('/');
            }



            if ($window.localStorage.token && nextRoute.access.restricted === true) {
                $http.post('/api/verify', { token: $window.localStorage.token }).then(function (res) {
                    console.log('Your token is valid');
                }, function (err) {
                    delete $window.localStorage.token;
                    $location.path('/login');
                });
            }
        });
    });

    app.config(function ($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);

        $routeProvider.when('/', {
            templateUrl: './templates/main.html',
            controller: 'MainController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        });

        $routeProvider.when('/login', {
            templateUrl: './templates/login.html',
            controller: 'LoginController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        });

        $routeProvider.when('/register', {
            templateUrl: './templates/register.html',
            controller: 'RegisterController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        });

        $routeProvider.when('/polls', {
            templateUrl: './templates/polls.html',
            controller: 'PollsController',
            controllerAs: 'vm',
            access: {
                restricted: true
            }
        });

        $routeProvider.when('/polls/:id', {
            templateUrl: './templates/poll.html',
            controller: 'PollController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        });

        $routeProvider.when('/profile', {
            templateUrl: './templates/profile.html',
            controller: 'ProfileController',
            controllerAs: 'vm',
            access: {
                restricted: true
            }
        });
        $routeProvider.otherwise('/');
    });

    app.controller('MainController', MainController);
    function MainController($location, $window, $http) {

        var vm = this;
        vm.title = "MainController";
        vm.polls = [];
        vm.getAllPolls = function () {
            $http.get('/api/polls').then(function (res) {
                vm.polls = res.data;
            }, function (err) {
                console.log(err);
            });
        }

        vm.getAllPolls();
    }


    app.controller('LoginController', LoginController);
    function LoginController($location, $window, $http) {
        var vm = this;
        vm.title = "LoginController";
        vm.error = '';
        vm.user={
            name:'',
            password:''
        }
        vm.login = function () {
            if (vm.user) {
                $http.post('api/login', vm.user).then(function (res) {
                    $window.localStorage.token = res.data;
                    $location.path('/profile');
                }, function (err) {
                    vm.error = err;
                })
            }
            else {
                console.log('You are not registered');
            }
        };
    }

    app.controller('RegisterController', RegisterController);
    function RegisterController($location, $window, $http) {
        var vm = this;
        vm.title = "RegisterController";
        vm.error = '';
        vm.user={
            user:'',
            password:''
        }
        vm.register = function () {
            if (!vm.user) {
                console.log('Invalid credentials');
            }
            $http.post('/api/register', vm.user).then(function (res) {
                $window.localStorage.token = res.data;
                $location.path('/profile');
            }, function (err) {
                vm.error = err.data.errmsg;
                vm.user=null;
            });
        }
    }

    app.controller('PollsController', PollsController);
    function PollsController($location, $window, $http, jwtHelper) {
        var vm = this;
        vm.title = "PollsController";
        vm.polls = [];
        vm.poll = {
            options: [],
            name: ''
        }
        vm.poll.options = [{
            name: '',
            votes: 0
        }]
        vm.addOption = function () {
            vm.poll.options.push({
                name: '',
                votes: 0
            });
        }
        vm.isLoggedIn = function () {
            if (!$window.localStorage.token) {
                return false;
            }
            if (jwtHelper.decodeToken($window.localStorage.token)) {
                return true;
            }
            return false;
        }
        vm.isLoggedIn();

        vm.getAllPolls = function () {
            $http.get('/api/polls').then(function (res) {
                vm.polls = res.data;
            }, function (err) {
                console.log(err);
            });
        }

        vm.getAllPolls();

        vm.addPoll = function () {
            if (!$window.localStorage.token) {
                console.log('You need and account');
                return;
            }
            if (vm.poll) {
                var payload = {
                    owner: jwtHelper.decodeToken($window.localStorage.token).data.name || null,
                    name: vm.poll.name,
                    options: vm.poll.options,
                    token: $window.localStorage.token
                }


                $http.post('/api/polls', payload).then(onSuccess, onError);
            }
            else {
                console.log('No data');
            }
        }
        var onSuccess = function (res) {

            vm.poll = {
                options: [],
                name: ''
            }
            vm.poll.options = [{
                name: '',
                votes: 0
            }]

            vm.getAllPolls();
        }
        var onError = function (err) {
            console.error(err);
        }
    }


    app.controller('PollController', PollController);
    function PollController($location, $window, $http, $routeParams) {
        var vm = this;
        vm.title = "PollController";
        vm.poll;
        vm.data;
        vm.link = ''+$location.path;

        vm.addOption = function () {
            if (vm.option && $window.localStorage.token) {
                $http.put('/api/polls/add-option', { option: vm.option, id: $routeParams.id }).then(function (res) {
                    vm.poll.push({
                        name: vm.option,
                        votes: 0
                    });
                    vm.option = null;
                    vm.getPoll();
                }, function (err) {
                    console.log(err);
                });
            }
            else{
                console.log('You need authentication');
            }
        }

        vm.getPoll = function () {
            var id = $routeParams.id;
            $http.get('/api/polls/' + id).then(function (res) {
                vm.id = res.data._id;
                vm.owner = res.data.owner;
                vm.poll = res.data.options;
                vm.data = res.data;
                google.charts.load('current', { 'packages': ['corechart'] });
                google.charts.setOnLoadCallback(drawChart);
            }, function (err) {
                $location.path('/polls');
                console.log(err)
            });
        }
        vm.getPoll();

        function drawChart() {
            var chartArray = [];
            chartArray.push(['Name', 'Votes', { role: "style" }]);
            for (var i = 0; i < vm.data.options.length; i++) {
                chartArray.push([vm.data.options[i].name, vm.data.options[i].votes, '#' + Math.floor(Math.random() * 16777215).toString(16)]);
            }

            var data = google.visualization.arrayToDataTable(chartArray);

            var view = new google.visualization.DataView(data);
            view.setColumns([0, 1, { calc: "stringify", sourceColumn: 1, type: "string", role: "annotation" }, 2]);

            var options = {
                title: vm.data.name
            }

            var chart = new google.visualization.ColumnChart(document.getElementById('columnchart_values'));

            chart.draw(view, options);
        }

        vm.vote = function () {

            if (vm.selected) {
                $http.put('/api/polls', { id: $routeParams.id, vote: vm.selected })
                    .then(function (res) {
                        vm.getPoll();
                    }, function (err) {
                        console.log(err);
                    })
            }
            else {
                console.log(err);
            }
        }


    }

    app.controller('ProfileController', ProfileController);
    function ProfileController($location, $window, jwtHelper, $http, $timeout) {
        var vm = this;
        vm.title = "ProfileController";
        vm.currentUser = null;
        vm.polls = [];
        var token = $window.localStorage.token;



        vm.getPollsByUser = function () {
            $http.get('/api/user-polls/' + vm.currentUser.name).then(function (res) {

                vm.polls = res.data;
            }, function (err) {
                console.log(err);
            });
        }

        vm.deletePoll = function (id) {
            if (id !== null) {
                $http.delete('/api/polls/' + id).then(function (res) {
                    vm.getPollsByUser();
                }, function (err) {
                    console.log(err);
                });
            }
            else {
                return false
            }
        }

        if (token) {
            vm.currentUser = jwtHelper.decodeToken(token).data;

            if (vm.currentUser !== null) {
                vm.getPollsByUser();
            }
        }





        vm.logOut = function () {
            $window.localStorage.removeItem('token');
            vm.message = 'Logging out';
            $timeout(function () {
                vm.message = '';
                $location.path('/')
            }, 1000);
        }
    }
}());
