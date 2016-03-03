angular.module('run.controller', [])

.controller('RunController',
  function ($scope, $timeout, $interval, $window,
            $location, $route, Geo, Run, Profile) {

  $scope.userLocation;
  $scope.destination;
  $scope.hasHours = true;

  var startTime;
  var runTime;
  var statusUpdateLoop;
  var startLat;
  var startLong;
  var FINISH_RADIUS = 0.0002; // miles?

  // Math functions
  var sqrt = Math.sqrt;
  var floor = Math.floor;
  var random = Math.random;
  var pow2 = function (num) {
    return Math.pow(num, 2);
  };

  // Update run timer
  var updateTotalRunTime = function () {
    var secondsRan = moment().diff(startTime, 'seconds');
    runTime = moment().minute(0).second(secondsRan);
  };

  // Define waiting messages for the user while Google maps loads...
  var messages = [
    "Finding the best route for you",
    "Scanning the streets",
    "Charging runtime engine",
    "Looking into the eye of the tiger"
  ];

  var setRunMessage = function () {
    $scope.runMessage = messages[floor(random() * messages.length)] + "...";
  };

  // Display random waiting message
  $interval(setRunMessage, random() * 1000, messages.length);

  $scope.startRun = function () {
    // Simulate finishing run for manual testing
    // setTimeout(finishRun, 4000); // simulate finishing run for manual testing
    startTime = moment();
    $scope.raceStarted = true;
    statusUpdateLoop = $interval(updateStatus, 100);
    Run.setPointsInTime($scope);
    Run.setInitialMedalGoal($scope);
    document.getElementById('map').style.height = "93vh";
    document.getElementById('botNav').style.height = "7vh";
  };

  // Generate a new map or route after initial map has been loaded
  $scope.regenRace = function () {
    $route.reload();
  };

  // Generates google map with current location marker and run route details
  var makeInitialMap = function () {
    Geo.makeInitialMap($scope);
  };

  makeInitialMap();

  // Handle end run conditions. Update user profile to reflect latest run.
  var finishRun = function () {
    $scope.$parent.runTime = runTime.format('mm:ss');
    var medal = $scope.$parent.achievement = $scope.currentMedal;

    var date = new Date();

    var endLocation = {
      latitude: $scope.destination.lat,
      longitude: $scope.destination.long
    };
    var googleExpectedTime = null;
    var timeTuple = runTime.format('mm:ss').split(':');
    var actualTime = 60 * (+timeTuple[0]) + +timeTuple[1];

    var currentRunObject = {
      date: date,
      startLocation: {
        longitude: null,
        latitude: null
      },
      endLocation: {
        longitude: $scope.destination.long,
        latitude: $scope.destination.lat
      },
      googleExpectedTime: null,
      distance: $scope.totalDistance,
      actualTime: actualTime,
      medalReceived: medal,
      racedAgainst: null
    };

    // Update current user's profile
    Profile.getUser()
    .then(function (user) {
      var achievements = user.achievements;
      var previousRuns = user.runs;
      //update achievments object
      achievements[medal] = achievements[medal] + 1;
      $window.localStorage.setItem('achievements', JSON.stringify(achievements));
      //update runs object
      previousRuns.push(currentRunObject);
      updatedAchievementsData = {
        achievements: achievements,
        runs: previousRuns
      };
      Profile.updateUser(updatedAchievementsData, user)
      .then(function (updatedProfile) {
        return updatedProfile;
      })
      .catch(function (err) {
        console.error(err);
      });
    });

    $interval.cancel(statusUpdateLoop);
    $location.path('/finish');
  };

  // Check if user is in close proximity to destination
  var checkIfFinished = function () {
    if ($scope.destination && $scope.userLocation) {
      var distRemaining = distBetween($scope.userLocation, $scope.destination);
      if (distRemaining < FINISH_RADIUS) {
        finishRun();
      }
    }
  };

  // Calculate distance between two coordinates
  var distBetween = function (loc1, loc2) {
    return sqrt(pow2(loc1.lat - loc2.lat) + pow2(loc1.lng - loc2.lng));
  };

  // Update geographical location and timers
  var updateStatus = function () {
    Geo.updateCurrentPosition($scope);
    updateTotalRunTime();
    Run.updateGoalTimes($scope);
    checkIfFinished();
  };

  // Stop geotracker upon canceling run
  // Does this make sure to stop tracking if they close the window? --> all scripts die when the browser is no longer interpreting them
  $scope.$on('$destroy', function () {
    $interval.cancel(statusUpdateLoop);
  });
});
