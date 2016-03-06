angular.module('bolt.createProfile', ['bolt.auth'])
// This controller is tied to 'createProfile.html'
.controller('CreateProfileController', function ($location, $scope, Profile, $window, Auth) {
  // Define inputData object to store the user's data
  $scope.inputData = {};
  // This will be the mechanism by which profiles are created / updated. It
  // will set the new data to $scope (so it's accessible to other controllers)
  // and update the user in our Mongo DB

  // Creates temporary FB authentication
  $scope.createFbToken = function() {
    if ($window.localStorage.facebook) {
      var token = $location.path().split('=')[1];
      $window.localStorage.removeItem('facebook');
      $window.localStorage.setItem('com.bolt', token);
      Profile.getUser(function(user) {
        console.log(user);
        $window.localStorage.setItem('preferredDistance', user.preferredDistance);
        $window.localStorage.setItem('runs', user.runs);
        $window.localStorage.setItem('achievements', JSON.stringify(user.achievements));

        $scope.session.username = user.username;
        $scope.session.firstName = user.firstName;
        $scope.session.lastName = user.lastName;
        $scope.session.email = user.email;

        console.log('one', $scope.session);
      }, true);
    }
  };

  $scope.createProfile = function (inputData) {
    $location.path('/profile');
    newData = {
      username: $scope.session.username,
      firstName: $scope.session.firstName,
      lastName: $scope.session.lastName,
      email: $scope.session.email,
      phone: $scope.session.phone,
      preferredDistance: $scope.session.preferredDistance
    };
    // Loop through the inputData object to update any new pieces of user info.
    // If we didn't have this loop, the data in $scope would be stuck, getting
    // read and written over by this function. Looping through makes updates
    // possible.

    for (var key in inputData) {
      console.log(inputData);
      if (inputData.hasOwnProperty(key) && inputData[key]) {
        newData[key] = inputData[key];
        $window.localStorage.setItem(key, inputData[key]);
      }
    }

    // Update the DB
    Profile.getUser()
    .then(function (currentUser) {
      Profile.updateUser(newData, currentUser)
      .catch(function (err) {
        console.error(err);
      });
    });
  };

  $scope.session = window.localStorage;

  // Give signout ability to $scope
  $scope.signout = function () {
    Auth.signout();
  };
});
