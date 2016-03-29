angular.module('bolt.controller', [])

.controller('BoltController', function ($scope, $location, $window, Auth) {
  // checks for fb user to populate local storage
  $scope.checkFb = function() {
    if ($window.localStorage.facebook) {
      var path = $location.path();
      Auth.createFbToken(path, function(user) {
        $scope.session.username = user.username;
        $scope.session.firstName = user.firstName;
        $scope.session.lastName = user.lastName;
        $scope.session.email = user.email;
      });
    }
  };

  $scope.session = $window.localStorage;
  $scope.startRun = function () {
    // Check which radio button is selected
    if (document.getElementById("switch_3_left").checked) {
      // Solo run
      $location.path('/run');
    } else if (document.getElementById("switch_3_center").checked) {
      // Running with friends has not been implemented yet, this is a
      // placeholder for when this functionality has been developed.
      // For now redirect runners to solo run.
      $location.path('/run');
    } else {
      // Public run
      $location.path('/multiLoad');
    }
  };
});
