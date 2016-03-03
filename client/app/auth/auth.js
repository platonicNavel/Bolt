angular.module('bolt.auth', [])

.controller('AuthController', function ($scope, $window, $location, Auth) {
  $scope.user = {};
  // Sign the user in and write their important info into their session
  $scope.signin = function () {
    Auth.signin($scope.user)
      .then(function (session) {
        $window.localStorage.setItem('com.bolt', session.token);
        $window.localStorage.setItem('username', session.username);
        $window.localStorage.setItem('firstName', session.firstName);
        $window.localStorage.setItem('lastName', session.lastName);
        $window.localStorage.setItem('phone', session.phone);
        $window.localStorage.setItem('email', session.email);
        $window.localStorage.setItem('preferredDistance', session.preferredDistance);
        $window.localStorage.setItem('runs', session.runs);
        $window.localStorage.setItem('achievements', session.achievements);
        $location.path('/');
      })
      .catch(function (error) {
        $scope.errorDetected = true;
        // This is a general error message, although there could be more failure
        // cases other than the wrong username
        $scope.signinError = "Hmm... we can't seem to find that username in our DB. Could it be another?";
      });
  };

  $scope.signup = function () {
    // Sign the user up, and then get them to create a new Bolt profile at
    // '/createProfile'
    Auth.signup($scope.user)
      .then(function (session) {
        $window.localStorage.setItem('com.bolt', session.token);
        $window.localStorage.setItem('username', session.username);
        $window.localStorage.setItem('firstName', session.firstName);
        $window.localStorage.setItem('lastName', session.lastName);
        $window.localStorage.setItem('phone', session.phone);
        $window.localStorage.setItem('email', session.email);
        $window.localStorage.setItem('preferredDistance', session.preferredDistance);
        $window.localStorage.setItem('runs', session.runs);
        $window.localStorage.setItem('achievements', session.achievements);
        $location.path('/createProfile');
      })
      .catch(function (error) {
        //Generic error handling (could be built out)
        $scope.errorDetected = true;
        $scope.signupError = "Invalid username or password";
      });
  };

  $scope.fbSignIn = function() {
    FB.getLoginStatus(function(response) {
      console.log(response);
    });
  };
});



// angular.module('bolt.auth', [])

// .controller('AuthController', function ($scope, $window, $location, Auth) {
//   $scope.user = {};
//   // Sign the user in and write their important info into their session
//   $scope.signin = function () {
//     Auth.signin($scope.user)
//       .then(function (session) {
//         $window.localStorage.setItem('com.bolt', session.token);
//         $window.localStorage.setItem('username', session.username);
//         $window.localStorage.setItem('firstName', session.firstName);
//         $window.localStorage.setItem('lastName', session.lastName);
//         $window.localStorage.setItem('phone', session.phone);
//         $window.localStorage.setItem('email', session.email);
//         $window.localStorage.setItem('preferredDistance', session.preferredDistance);
//         $window.localStorage.setItem('runs', session.runs);
//         $window.localStorage.setItem('achievements', session.achievements);
//         $location.path('/');
//       })
//       .catch(function (error) {
//         $scope.errorDetected = true;
//         // This is a general error message, although there could be more failure
//         // cases other than the wrong username
//         $scope.signinError = "Hmm... we can't seem to find that username in our DB. Could it be another?";
//       });
//   };

//   $scope.signup = function () {
//     // Sign the user up, and then get them to create a new Bolt profile at
//     // '/createProfile'
//     Auth.signup($scope.user)
//       .then(function (token) {
//         $window.localStorage.setItem('com.bolt', token);
//         $window.localStorage.setItem('username', $scope.user.username);
//         $location.path('/createProfile');
//       })
//       .catch(function (error) {
//         //Generic error handling (could be built out)
//         $scope.errorDetected = true;
//         $scope.signupError = "Invalid username or password";
//       });
//   };
// });
