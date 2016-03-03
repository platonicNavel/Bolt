angular.module('bolt.services', [])

// Handle all location-based features
.factory('Geo', function ($window) {
  var session = $window.localStorage;
  var mainMap;
  var currentLocMarker;
  var destinationMarker;
  var directionsService = new google.maps.DirectionsService();
  var directionsRenderer = new google.maps.DirectionsRenderer();
  var route;

  // Create map around the users current location and their destination
  var makeInitialMap = function ($scope, destination) {
    navigator.geolocation.getCurrentPosition(function (position) {
        makeMap({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }, $scope);
      }, function (err) {
        console.error(err);
      });
    var makeMap = function (currentLatLngObj, $scope) {
      var destinationCoordinates = randomCoordsAlongCircumference(currentLatLngObj, (session.preferredDistance)/2);
      mainMap = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(currentLatLngObj.lat, currentLatLngObj.lng),
        zoom: 13,
        disableDefaultUI: true
      });
      directionsRenderer.setMap(mainMap);
      currentLocMarker = new google.maps.Marker({
        position: new google.maps.LatLng(currentLatLngObj.lat, currentLatLngObj.lng),
        map: mainMap,
        animation: google.maps.Animation.DROP,
        icon: '/assets/bolt.png'
      });
      var startOfRoute = new google.maps.LatLng(currentLocMarker.position.lat(), currentLocMarker.position.lng());
    
      var backToCurrent = new google.maps.LatLng(currentLocMarker.position.lat(), currentLocMarker.position.lng());

      var endOfRoute = new google.maps.LatLng(destinationCoordinates.lat, destinationCoordinates.lng); 
     
      $scope.destination = {
        lat: endOfRoute.lat(),
        lng: endOfRoute.lng()
      };

      route = directionsService.route({
        origin: startOfRoute,
        destination: backToCurrent,
        waypoints: [{ location: endOfRoute, stopover: false}],
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.WALKING,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
        provideRouteAlternatives: true
      }, function (response, status) {
        directionsRenderer.setDirections(response);
        var totalDistance = 0;
        // Add up distance for all legs of the journey
        for (var i = 0; i < response.routes[0].legs.length; i++) {
          var distance = response.routes[0].legs[i].distance.text;
          if (distance.substring(distance.length - 2) === "ft") {
            distance = (distance.substring(0, distance.length - 3) / 5280).toString().substring(0, 3) + " mi";
          }
          totalDistance += distance;
        }
        console.log('tot distance .... ', totalDistance);
        totalDistance = parseFloat(totalDistance) || 0.1; // If run distance is small display 0.1 miles
        $scope.totalDistance = totalDistance;

        // Change this to pull the users speed from their profile
        var userMinPerMile = 10;
        var hours = Math.floor(userMinPerMile * totalDistance / 60);
        var minutes = userMinPerMile * totalDistance;
        var seconds = minutes * 60;

        // Display projected time in a freindly format
        $scope.hasHours = hours > 0;
        $scope.goldTime = moment().second(seconds * 0.9).minute(minutes * 0.9).hour(hours * 0.9);
        $scope.silverTime = moment().second(seconds * 1.0).minute(minutes * 1.0).hour(hours * 1.0);
        $scope.bronzeTime = moment().second(seconds * 1.1).minute(minutes * 1.1).hour(hours * 1.1);
        $scope.$digest();
      });
    };
  };

  var updateCurrentPosition = function ($scope) {
    navigator.geolocation.getCurrentPosition(function (position) {
      currentLocMarker.setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
      if ($scope) {
        $scope.userLocation = {
          lat: currentLocMarker.position.lat(),
          lng: currentLocMarker.position.lng()
        };
      }
    }, function (err) {
      console.error(err);
    });
  };

  var randomCoordsAlongCircumference = function (originObj, radius) {
    var randomTheta = Math.random() * 2 * Math.PI;
    return {
      lat: originObj.lat + (radius / 69 * Math.cos(randomTheta)),
      lng: originObj.lng + (radius / 69 * Math.sin(randomTheta))
    };
  };

  return {
    makeInitialMap: makeInitialMap,
    updateCurrentPosition: updateCurrentPosition
  };

})

// Handle all tracking and rewards during the run
.factory('Run', function ($http) {

  var pointsInTime = {
    'Gold': '',
    'Silver': '',
    'Bronze': ''
  };

  var updateTimeUntilMedal = function (secondsToMedal) {
    return moment().second(secondsToMedal).minute(secondsToMedal / 60);
  };

  // Could refactor to handle a {gold, silver, bronze} object
  var setPointsInTime = function ($scope) {
    pointsInTime['Gold'] = moment().add($scope.goldTime.second(), 'seconds').add($scope.goldTime.minute(), 'minutes');
    pointsInTime['Silver'] = moment().add($scope.silverTime.second(), 'seconds').add($scope.silverTime.minute(), 'minutes');
    pointsInTime['Bronze'] = moment().add($scope.bronzeTime.second(), 'seconds').add($scope.bronzeTime.minute(), 'minutes');
  };

  // Initialize medal countdown to gold
  var setInitialMedalGoal = function ($scope) {
    $scope.currentMedal = 'Gold';
    var secondsToGold = pointsInTime['Gold'].diff(moment(), 'seconds');
    $scope.timeUntilCurrentMedal = updateTimeUntilMedal(secondsToGold);
  };

  // Make sure the next best medal is displayed with the correct time
  // Could refactor to handle a {gold, silver, bronze} object
  var updateGoalTimes = function ($scope) {
    if ($scope.currentMedal === 'Gold') {
      var secondsToGold = pointsInTime['Gold'].diff(moment(), 'seconds');
      if (secondsToGold === 0) {
        var secondsToSilver = pointsInTime['Silver'].diff(moment(), 'seconds');
        $scope.timeUntilCurrentMedal = updateTimeUntilMedal(secondsToSilver);
        $scope.currentMedal = 'Silver';
      } else {
        $scope.timeUntilCurrentMedal = updateTimeUntilMedal(secondsToGold);
      }
    } else if ($scope.currentMedal === 'Silver') {
      var secondsToSilver = pointsInTime['Silver'].diff(moment(), 'seconds');
      if (secondsToSilver === 0) {
        var secondsToBronze = pointsInTime['Bronze'].diff(moment(), 'seconds');
        $scope.timeUntilCurrentMedal = updateTimeUntilMedal(secondsToBronze);
        $scope.currentMedal = 'Bronze';
      } else {
        $scope.timeUntilCurrentMedal = updateTimeUntilMedal(secondsToSilver);
      }
    } else if ($scope.currentMedal === 'Bronze') {
      var secondsToBronze = pointsInTime['Bronze'].diff(moment(), 'seconds');
      if (secondsToBronze === 0) {
        $scope.currentMedal = 'High Five';
        $scope.timeUntilCurrentMedal = '';
      } else {
        $scope.timeUntilCurrentMedal = updateTimeUntilMedal(secondsToBronze);
      }
    }
  };

  return {
    setPointsInTime: setPointsInTime,
    setInitialMedalGoal: setInitialMedalGoal,
    updateGoalTimes: updateGoalTimes
  };

})

// Update and retrieve user information
.factory('Profile', function ($http) {

  return {
    updateUser : function (newInfo, user) {
      return $http({
        method: 'PUT',
        url: '/api/users/profile',
        data: {
          newInfo: newInfo,
          //The above 'newInfo' object needs to contain the same keys as
          //the DB, or else it will fail to PUT. E.g. newInfo needs to have
          //a 'firstName' key in the incoming object in order to update the
          //'firstName' key in the User DB. If it's named something else
          //('first', 'firstname', 'firstN', etc.), it won't work
          user: user
        }
      }).then(function (res) {
        return res;
      });
    },

    getUser : function () {
      return $http({
        method: 'GET',
        url: '/api/users/profile'
      }).then(function (user) {
        return user.data;
      });
    }
  };
})

// Handle multiplayer sessions to db
.factory('MultiGame', function ($http) {
  return {
    makeGame : function (id, user1, user2) {
      return $http({
        method: 'POST',
        url: '/api/games',
        data: {
          id: id
        }
      }).then(function (res) {
        return res;
      });
    },

    updateGame : function (id, field) {
      return $http({
        method: 'POST',
        url: '/api/games/update',
        data: {
          id: id,
          field: field
        }
      }).then(function (res) {
        return res;
      });
    },

    getGame : function (id) {
      return $http({
        method: 'GET',
        url: '/api/games/' + id
      }).then(function (res) {
        return res.data;
      });
    },

    removeGame: function (id) {
      return $http({
        method: 'POST',
        url: '/api/games/remove',
        data: {
          id: id
        }
      }).then(function (res) {
        return res;
      });
    }
  };
})

// Handle Authentication
.factory('Auth', function ($http, $location, $window) {
  // it is responsible for authenticating our user
  // by exchanging the user's username and password
  // for a JWT from the server
  // that JWT is then stored in localStorage as 'com.bolt'
  // after you signin/signup open devtools, click resources,
  // then localStorage and you'll see your token from the server
  var signin = function (user) {
    return $http({
      method: 'POST',
      url: '/api/users/signin',
      data: user
    })
    .then(function (resp) {
      return resp.data;
    });
  };

  var signup = function (user) {
    return $http({
      method: 'POST',
      url: '/api/users/signup',
      data: user
    })
    .then(function (resp) {
      return resp.data;
    });
  };

  // Checks token and ensures leftover tokens without usernames don't fly
  var isAuth = function () {
    return (!!$window.localStorage.getItem('com.bolt'))
        && (!!$window.localStorage.getItem('username'));
  };

  var signout = function () {
    $window.localStorage.removeItem('username');
    $window.localStorage.removeItem('first');
    $window.localStorage.removeItem('last');
    $window.localStorage.removeItem('firstName');
    $window.localStorage.removeItem('lastName');
    $window.localStorage.removeItem('phone');
    $window.localStorage.removeItem('email');
    $window.localStorage.removeItem('competitor');
    $window.localStorage.removeItem('preferredDistance');
    $window.localStorage.removeItem('runs');
    $window.localStorage.removeItem('achievements');
    $window.localStorage.removeItem('com.bolt');
    $location.path('/signin');
  };


  return {
    signin: signin,
    signup: signup,
    isAuth: isAuth,
    signout: signout
  };
})

.factory('DummyRuns', function() {
  function dummy() {
    function Run(date) {
      var distance = Math.random() * 5; //1 to 5 in miles per hour
      var time = (distance / (Math.random() * 2 + 4)) * (60 * 60);
      var obj = {
        date: date,
        startLocation: {
          longitude: null,
          latitude: null
        },
        endLocation: {
          longitude: null,
          latitude: null
        },
        googleExpectedTime: null,
        actualTime: time,
        distance: distance,
        medalReceived: null,
        racedAgainst: null
      };
      return obj;
    }

    var runs = [];
    var today = new Date();
    var date;
    var run;

    for (var i = 365; i >= 0; i--) {
      run = Math.random() > 0.5 ? 1 : 0;
      if (run) {
        date = new Date(today - 1000 * 60 * 60 * 24 * i);
        runs.push(Run(date));
      }
    }

    return runs;
  }

  return {
    dummy,
  };
})

.factory('Calendar', function() {
  function createCalendar(runs) {
    // var dates = runs.map(function(run) {
    //   return moment(run.date).format("YYYY-MM-DD");
    // });

    var dates = runs.reduce(function(prevObject, currObject) {
      var date = moment(currObject.date).format("YYYY-MM-DD");
      var distance = currObject.distance;
      prevObject.date = distance;
      return prevObject;
    }, {});

    var width = 960;
    var height = 136;
    var cellSize = 17;
    var colors = ['#edf8e9','#c7e9c0','#a1d99b','#74c476','#31a354','#006d2c'];

    var today = new Date();
    var yearAgo = new Date(today - 1000 * 60 * 60 * 24 * 365);

    var percent = d3.format(".1%"),
        format = d3.time.format("%Y-%m-%d");

    var colorScale = d3.scale
      .quantile()
      .domain([d3.min()])

    // var color = d3.scale.quantize()
    //     .domain([-.05, .05])
    //     .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

    var svg = d3.select(".calendar")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "RdYlGn")
        .append("g")
        .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

    var rect = svg.selectAll(".day")
        .data(d3.time.days(yearAgo, today))
      .enter().append("rect")
        .attr("class", "day")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", function(d) { return weeksSince(yearAgo, d) * cellSize; })
        .attr("y", function(d) { return d.getDay() * cellSize; })
        .datum(format);

    rect.append("title")
        .text(function(d) { return d; });

    rect.filter(function(d) { return dates.indexOf(d) !== -1; })
      .style('fill', 'rgb(255, 0, 0)')

    // shift switches at end of saturday
    function getLastSaturday(d) {
      var date = new Date(d);
      var dayOfWeek = date.getDay();
      var diff = date.getDate() - dayOfWeek - 1;
      return new Date(date.setDate(diff));
    }

    function weeksSince(firstDay, currentDay) {
      var week = 1000 * 60 * 60 * 24 * 7;
      var d1 = firstDay.getTime();
      var d2 = currentDay.getTime();
      var lastSaturday = getLastSaturday(d1);
      return Math.floor((d2 - lastSaturday) / week);
    }
  }

  return {
    createCalendar,
  }

})
.factory('RateGraph', function() {
  function createRateGraph(runs) {
    var data = runs.map(function(run) {
      return [run.actualTime / 60, run.distance];
    });

    var margin = {
      top: 20,
      right:15,
      bottom: 60,
      left: 60,
    };

    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var x = d3.scale.linear()
      .domain([0, d3.max(data, function(d) { return d[0]; })])
      .range([0, width]);

    var y = d3.scale.linear()
      .domain([0, d3.max(data, function(d) { return d[1]; })])
      .range([height, 0]);

    var chart = d3.select('.rateGraph')
      .append('svg:svg')
      .attr('width', width + margin.right + margin.left)
      .attr('height', height + margin.top + margin.bottom)
      .attr('class', 'chart');

    var main = chart.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'main');

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom');

    main.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .attr('class', 'main axis date')
      .call(xAxis);

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');

    main.append('g')
      .attr('transform', 'translate(0, 0)')
      .attr('class', 'main axis date')
      .call(yAxis);

    var g = main.append('svg:g');

    g.selectAll('scatter-dots')
      .data(data)
      .enter()
      .append('svg:circle')
        .attr('cx', function (d, i) { return x(d[0]); })
        .attr('cy', function (d, i) { return y(d[1]); })
        .attr('r', 8)
        .style('fill', 'rgba(255, 0, 0, 0.3)');

  }

  return {
    createRateGraph,
  }
})
