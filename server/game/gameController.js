import Game from './gameModel';
import Q from 'q';


const findGame = Q.nbind(Game.findOne, Game);
const createGame = Q.nbind(Game.create, Game);


export default {
  // Create new multiplayer match
  makeGame(req, res, next) {
    const user1 = req.body.user1;
    const user2 = req.body.user2;
    createGame({
      player1: user1,
      player2: user2,
      active: true,
    })
    .then((newGame) => {
      console.log(newGame);
      res.send(201, newGame._id);
    });
  },

  // Delete specified game from database
  cancelGame(gameId, res) {
    findGame({ _id: `ObjectId(${gameId})` })
      .then((targetGame) => {
        console.log(targetGame);
        targetGame.active = false;
        res.send(201, targetGame);
      })
      .catch((err) => {
        console.error(err);
      });
  },
};
