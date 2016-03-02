import Game from './multiGameModel';
import Q from 'q';
import helpers from '../config/helpers';

// Define promisified versions of mongoose methods
const findGame = Q.nbind(Game.findOne, Game);
const createGame = Q.nbind(Game.create, Game);
const updateGame = Q.nbind(Game.update, Game);
const removeGame = Q.nbind(Game.remove, Game);

export default {
  // Check whether game is in database, if not then create game
  makeGame(req, res, next) {
    const id = req.body.id;
    findGame({ id }).then((game) => {
      if (game) {
        res.send(201, game);
      } else {
        createGame({
          id,
        })
        .then((newGame) => {
          console.log(newGame);
          res.send(201, newGame._id);
        });
      }
    });
  },

  // Retrieve game instance from database
  getGame(gameId, res, next) {
    findGame({ id: gameId }).then((game) => {
      res.send(201, game);
    });
  },

  // Update specified field for a given game instance
  updateGame(req, res, next) {
    const id = req.body.id;
    const field = req.body.field;
    const updateQuery = { $set: {} };
    updateQuery.$set[field] = true;
    updateGame({ id }, updateQuery).then((game) => {
      res.send(201, game);
    });
  },

  // Remove specified game instance from database
  removeGame(req, res, next) {
    const id = req.body.id;
    removeGame({ id }).then((game) => {
      res.send(201, game);
    });
  },
};
