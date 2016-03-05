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
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
        avoidHighways: true,
        provideRouteAlternatives: false
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
      var distance = Math.random() * 5 + 1; //1 to 5 in miles per hour
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

    var calendar = document.getElementsByClassName('calendar')[0];
    while (calendar.childNodes.length) {
      calendar.removeChild(calendar.childNodes[calendar.childNodes.length - 1]);
    }
    // while (calendar.firstChild) {
    //   calendar.removeChild(calendar.firstChild);
    // }


    var dates = runs.reduce(function(acc, curr) {
      var date = moment(curr.date).format("YYYY-MM-DD");
      var distance = curr.distance;
      acc[date] = distance;
      return acc;
    }, {});

    var visibleWeeks = [];
    var i = 0;
    while (visibleWeeks.length < 53) {
      visibleWeeks.push(i);
      i++;
    }

    var containingWidth = d3.select('.calendar')[0][0].clientWidth;
    
    var dateScale = d3.scale.quantize().domain([0, 960]).range(visibleWeeks);

    var today = new Date();
    var numWeeks = dateScale(containingWidth)
    var yearAgo = new Date(today - 1000 * 60 * 60 * 24 * 7 * numWeeks);


    // margin needs to be large enough to contain axis labels
    var cellSize = containingWidth / numWeeks * 0.9;
    var marginTop = cellSize;
    var marginLeft = cellSize / 1.5;
    var width = containingWidth;
    var height = cellSize * 7;
    var colors = ['#c7e9c0','#a1d99b','#74c476','#31a354','#006d2c'];

    var percent = d3.format(".1%"),
        format = d3.time.format("%Y-%m-%d");


    var values = Object.keys(dates)
      .map(function(key) { return dates[key] });

    var colorScale = d3.scale
      .quantile()
      .domain([d3.min(values), d3.max(values)])
      .range(colors);

    var tooltip = d3.select('.calendar')
      .append('div')
      .attr('id', 'tooltip')
      .style('position', 'absolute')
      .style('z-index', '10')
      .style('visibility', 'hidden')
      .text('a simple tooltip');

    var svg = d3.select(".calendar")
        .append("svg")
        .attr("width", (width + marginLeft))
        .attr("height", height + marginTop)
        .attr("class", "RdYlGn")
        .append("g")
        .attr("transform", "translate(" + marginLeft + "," + marginTop+ ")");

    var rect = svg.selectAll(".day")
        .data(d3.time.days(yearAgo, today))
        .enter().append("rect")
        .attr("class", "day")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", function(d) { return weeksSince(yearAgo, d) * cellSize; })
        .attr("y", function(d) { return d.getDay() * cellSize; })
        .datum(format);

    rect.on('mouseover', mouseover);
    rect.on('mouseout', mouseout);

    function mouseover(d) {
      d3.select(this.parentNode.appendChild(this)).classed('cell-hover', true);
      tooltip.style('visibility', 'visible');
      var tooltipText;
      if (!dates[d]) {
        tooltipText = '<span>No runs on </span>'
      } else {
        tooltipText = '<span>' + Math.round(dates[d]*10)/10 + ' miles run </span> on '
      }
      tooltipText += d

      tooltip.transition()
        .duration(200)
        .style('opacity', .9);

      tooltip.html(tooltipText)
        .style('left', (d3.event.pageX) + 30 + 'px')
        .style('top', (d3.event.pageY) + 'px')

    }

    function mouseout(d) {
      d3.select(this).classed('cell-hover', false);
      tooltip.transition()
        .duration(200)
        .style('opacity', 0);
      var $tooltip = $("#tooltip");
      $tooltip.empty();
    }

    var week = ['', 'M', '', 'W', '', 'F', '']
    var yLabels = svg.selectAll(".wday")
        .data(week)
        .enter()
        .append('text')
        .style('font-size', cellSize / 1.5)
        .attr("x", 0)
        .attr("y", function(d, i) { return (i + 0.8) * cellSize; })
        .text(function(d) { return d; });

    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    var months = []
    var curMonth = yearAgo.getMonth();
    while (months.length < numWeeks/4) {
      months.push(monthNames[curMonth % monthNames.length]);
      curMonth++;
    }
    var xLabels = svg.selectAll(".month")
        .data(months)
        .enter()
        .append('text')
        .attr("x", function(d, i) { return cellSize + cellSize * 4 * i; })
        .attr("y", - cellSize / 3)
        .attr('font-size', cellSize / 1.5)
        .text(function(d) {return d; });

    rect.append("title")
        .text(function(d) { return d; });

    rect.filter(function(d) { return d in dates; })
      .style('fill', function(d) { return colorScale(dates[d]) })

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

    var rateGraph = document.getElementsByClassName('rateGraph')[0];
    if (rateGraph.childNodes.length) {
      rateGraph.removeChild(rateGraph.childNodes[0]);
    }

    var containingWidth = d3.select('.rateGraph')[0][0].clientWidth;
    var containingHeight = $('.recent-runs').height();
    console.log(containingHeight);

    var margin = {
      top: 25,
      right:30,
      bottom: 50,
      left: 40,
    };

    var width = containingWidth - margin.left - margin.right;
    var height = containingHeight - margin.top - margin.bottom;
    var radius = containingWidth * 0.012;


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
      .orient('bottom')
      .ticks(8)
      .outerTickSize(0);

    main.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .attr('class', 'main axis date')
      .call(xAxis);

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .ticks(5)
      .outerTickSize(0);

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
        .attr('r', radius)
        .style('fill', 'rgba(255, 0, 0, 0.3)');


    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'translate(' + (-margin.left/2) + ',' + height /2 + ')rotate(-90)')
      .text('Miles');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'translate(' + width / 2+ ',' + (height + margin.top + margin.bottom/3) + ')')
      .text('Minutes')


  }

  return {
    createRateGraph,
  }
})
.factory('Statistics', function() {
  
  function generateStatistics(runs) {
    function getTotal(runsArr, distanceOrTime) {
      return runsArr.reduce(function(acc, curr) {
        return acc + curr[distanceOrTime];
      }, 0);
    }

    function getSingleMax(runsArr, distanceOrTime) {
      return runsArr.reduce(function(acc, curr) {
        return curr[distanceOrTime] > acc ? curr[distanceOrTime] : acc;
      }, 0);
    }

    function getMaxAverage(runsArr) {
      return runs.reduce(function(acc, run) {
        var currentPace = run.actualTime / run.distance;
        return currentPace < acc ? currentPace : acc;
      }, 0);
    }

    function padZeroes(num, minLength) {
      var string = num.toString();
      var newString = string;
      while (newString.length < minLength) {
        newString = '0' + newString;
      } 
      return newString;
    }

    function secondsToMMSS(seconds) {
      var prefix = seconds >= 0 ? '' : '-';
      seconds = Math.abs(seconds);
      var minutes = Math.floor(seconds / 60);
      var remainingSeconds = Math.floor(seconds % 60);
      return prefix + padZeroes(minutes, 2) + ':' + padZeroes(remainingSeconds, 2);
    }

    function secondsToHHMMSS(seconds) {
      var hours = Math.floor(seconds / 3600);
      seconds = seconds % 3600;
      var minutes = Math.floor(seconds / 60);
      var remainingSeconds = Math.floor(seconds % 60);
      return padZeroes(hours, 2) + ':' + padZeroes(minutes, 2) + ':' + padZeroes(remainingSeconds, 2);
    }

    function roundDistance(distance) {
      return Math.round(distance * 10) / 10;
    }

    var totalTimeInSeconds = getTotal(runs, 'actualTime');
    var totalDistance = getTotal(runs, 'distance');
    var totalRuns = runs.length;

    var total = {};
    total.distance = roundDistance(totalDistance);
    total.runs = totalRuns;
    total.time = secondsToHHMMSS(totalTimeInSeconds);

    var average = {};
    average.distance = roundDistance(totalDistance / totalRuns);
    average.time = secondsToHHMMSS(totalTimeInSeconds / totalRuns);
    average.pace = secondsToMMSS(totalTimeInSeconds / totalDistance);

    var best = {};
    best.distance = roundDistance(getSingleMax(runs, 'distance'));
    best.time = secondsToHHMMSS(getSingleMax(runs, 'actualTime'));
    best.pace =  secondsToMMSS(getMaxAverage(runs));

    var latestSevenRuns = runs.slice(runs.length - 7);
    var latestSevenTimeInSeconds = getTotal(latestSevenRuns, 'actualTime');
    var latestSevenDistance = getTotal(latestSevenRuns, 'distance');
    var latestSevenNumRuns = latestSevenRuns.length;
    var latestSevenPaceInSeconds = latestSevenTimeInSeconds / latestSevenDistance;


    var latestSeven = {};
    latestSeven.distance = roundDistance(latestSevenDistance);
    latestSeven.avgDistance = roundDistance(latestSevenDistance / latestSevenNumRuns);
    latestSeven.pace = secondsToMMSS(latestSevenPaceInSeconds);

    var previousSevenRuns = runs.slice(runs.length - 14, runs.length - 7);
    var previousSevenTimeInSeconds = getTotal(previousSevenRuns, 'actualTime');
    var previousSevenDistance = getTotal(previousSevenRuns, 'distance');
    var previousSevenNumRuns = previousSevenRuns.length;
    var previousSevenPaceInSeconds = previousSevenTimeInSeconds / previousSevenDistance;

    var previousSeven = {};
    previousSeven.distance = roundDistance(previousSevenDistance);
    previousSeven.avgDistance = roundDistance(previousSevenDistance / previousSevenNumRuns);
    previousSeven.pace = secondsToMMSS(previousSevenPaceInSeconds);

    var diff = {};
    diff.distance = roundDistance(latestSeven.distance - previousSeven.distance);
    diff.avgDistance = roundDistance(latestSeven.avgDistance - previousSeven.avgDistance);
    diff.pace = secondsToMMSS(latestSevenPaceInSeconds - previousSevenPaceInSeconds);

    return {
      total,
      average,
      best,
      latestSeven,
      previousSeven,
      diff,
    }
  }

  return {
    generateStatistics,
  }
})