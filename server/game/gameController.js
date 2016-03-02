import Game from './gameModel';
import Q from 'q';
import helpers from '../config/helpers';


var findGame = Q.nbind(Game.findOne, Game);
var createGame = Q.nbind(Game.create, Game);


export default {
  // Create new multiplayer match
  makeGame: function (req, res, next) {
    var user1 = req.body.user1;
    var user2 = req.body.user2;
    createGame({
      player1: user1,
      player2: user2,
      active: true
    })
    .then(function (newGame) {
      console.log(newGame);
      res.send(201, newGame._id);
    });
  },

  // Delete specified game from database
  cancelGame: function (gameId, res) {
    findGame({_id : "ObjectId(" + gameId + ")"})
      .then(function (targetGame) {
        console.log(targetGame);
        targetGame.active = false;
        res.send(201, targetGame);
      })
      .catch(function (err) {
        console.error(err);
      });
  }
};