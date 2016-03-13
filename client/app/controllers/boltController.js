angular.module('bolt.controller', [])

.controller('BoltController', function ($scope, $location, $window) {
  if ($window.localStorage.facebook) {
    $window.localStorage.removeItem('facebook');
  }

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
