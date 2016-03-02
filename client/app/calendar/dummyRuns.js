function Run(date) {
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
    actualTime: null,
    medalReceived: null,
    racedAgainst: null
  };
  return obj;
}

var year = [];
var today = new Date();
var date;
var run;

for (var i = 365; i >= 0; i--) {
  run = Math.random() > 0.5 ? 1 : 0;
  if (run) {
    date = new Date(today - 1000 * 60 * 60 * 24 * i);
    year.push(Run(date));
  }
}

//need to filter unique
year.map(function(run) {
  return run.date;
})