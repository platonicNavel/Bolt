import Game from './multiGameModel';
import Q from 'q';
import helpers from '../config/helpers';

// Define promisified versions of mongoose methods
var findGame = Q.nbind(Game.findOne, Game);
var createGame = Q.nbind(Game.create, Game);
var updateGame = Q.nbind(Game.update, Game);
var removeGame = Q.nbind(Game.remove, Game);

module.exports = {
  // Check whether game is in database, if not then create game
  makeGame: function (req, res, next) {
    var id = req.body.id;
    findGame({id: id}).then(function (game) {
      if (game) {
        res.send(201, game);
      } else {
        createGame({
          id: id
        })
        .then(function (newGame) {
          console.log(newGame);
          res.send(201, newGame._id);
        });
      }
    });
  },

  // Retrieve game instance from database
  getGame: function (gameId, res, next) {
    findGame({id: gameId}).then(function (game) {
      res.send(201, game);
    });
  },

  // Update specified field for a given game instance
  updateGame: function (req, res, next) {
    var id = req.body.id;
    var field = req.body.field;
    var updateQuery = {$set: {}};
    updateQuery.$set[field] = true;
    updateGame({id: id}, updateQuery).then(function (game) {
      res.send(201, game);
    });
  },

  // Remove specified game instance from database
  removeGame: function (req, res, next) {
    var id = req.body.id;
    removeGame({id: id}).then(function (game) {
      res.send(201, game);
    });
  }
};
