angular.module('bolt', [
  'bolt.services',
  'bolt.auth',
  'bolt.profile',
  'ngRoute',
  'bolt.controller',
  'run.controller',
  'finish.controller',
  'multiload.controller',
  'multirun.controller',
  'bolt.createProfile',
  'achievements.controller'
])
.config(function ($routeProvider, $httpProvider) {
  // Configure various routes
  $routeProvider
    .when('/', {
      // home page
      templateUrl: 'app/views/bolt.html',
      controller: 'BoltController',
      authenticate: true
    })
    .when('/run', {
      // single-player run
      templateUrl: 'app/views/run.html',
      controller: 'RunController',
      authenticate: true
    })
    .when('/finish', {
      // user finishes a run
      templateUrl: 'app/views/finish.html',
      controller: 'FinishController',
      authenticate: true
    })
    .when('/achievements', {
      // user requests their achievements
      templateUrl: 'app/views/achievements.html',
      controller: 'AchievementsController',
      authenticate: true
    })
    .when('/multiLoad', {
      // loading multiplayer game
      templateUrl: 'app/views/multiLoad.html',
      controller: 'MultiLoadController',
      authenticate: true
    })
    .when('/multiGame', {
      // running a multiplayer race
      templateUrl: 'app/views/multiRun.html',
      controller: 'MultiRunController',
      authenticate: true
    })
    .when('/signin', {
      templateUrl: 'app/auth/signin.html',
      controller: 'AuthController'
    })
    .when('/signup', {
      templateUrl: 'app/auth/signup.html',
      controller: 'AuthController'
    })
    .when('/profile', {
      // user viewing their profile information
      templateUrl: 'app/views/profile.html',
      controller: 'ProfileController',
      authenticate: true
    })
    .when('/createProfile', {
      // user creating/updating their profile info
      templateUrl: 'app/views/createProfile.html',
      controller: 'CreateProfileController',
      authenticate: true
    })
    .when('/createProfile/:token', {
      // user creating/updating their profile info
      templateUrl: 'app/views/createProfile.html',
      controller: 'CreateProfileController',
      authenticate: true
    })
    .when('/:token', {
      // user creating/updating their profile info
      templateUrl: 'app/views/bolt.html',
      controller: 'BoltController',
      authenticate: true
    })
    .otherwise({
      redirectTo: '/'
    });
    // We add our $httpInterceptor into the array of interceptors. Think of it
    // like middleware for your ajax calls
    $httpProvider.interceptors.push('AttachTokens');
})

.factory('AttachTokens', function ($window) {
  // this is an $httpInterceptor
  // its job is to stop all out going request
  // then look in local storage and find the user's token
  // then add it to the header so the server can validate the request
  var attach = {
    request: function (object) {
      var jwt = $window.localStorage.getItem('com.bolt');
      if (jwt) {
        object.headers['x-access-token'] = jwt;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
  return attach;
})
.run(function ($rootScope, $location, Auth) {
  // here inside the run phase of angular, our services and controllers
  // have just been registered and our app is ready
  // however, we want to make sure the user is authorized
  // we listen for when angular is trying to change routes
  // when it does change routes, we then look for the token in localstorage
  // and send that token to the server to see if it is a real user or hasn't expired
  // if it's not valid, we then redirect back to signin/signup
  $rootScope.$on('$routeChangeStart', function (evt, next, current) {
    if (next.$$route && next.$$route.authenticate && !Auth.isAuth()) {
      $location.path('/signin');
    }
  });
});
