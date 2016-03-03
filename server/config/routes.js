import userController from '../users/userController.js';
import gameController from '../game/multiGameController';
import passport from 'passport';
import helpers from './helpers.js'; // our custom middleware
import Promise from 'bluebird';
import express from 'express';
import fb from '../utils/facebook';

export default (app, express) => {
  // auth via email
  app.get('/api/users/profile', userController.getUser);
  app.get('/api/users/signedin', userController.checkAuth);

  app.post('/api/games', gameController.makeGame);

  app.get('/auth/facebook', fb.fbAuthRoute);
  app.get('/login/facebook/callback', fb.fbAuthCbRoute);

  // Route to obtain specified multiplayer game instance
  app.route('/api/games/:game_id')
  .get((req, res) => {
    gameController.getGame(req.params.game_id, res);
  });

  // Route to create new multiplayer game instances
  app.route('api/games/:game_id')
  .post((req, res) => {
    gameController.cancelGame(req.params.game_id, res);
  });

  // Route to update specified multiplayer game instance
  app.post('/api/games/update', gameController.updateGame);

  // Route to remove specified multiplayer game instance
  app.post('/api/games/remove', gameController.removeGame);

  // Route to sign in users
  app.post('/api/users/signin', userController.signin);

  // Route to sign up users
  app.post('/api/users/signup', userController.signup);

  // Route to update user preferences and settings
  app.put('/api/users/profile', userController.updateUser);

  // If a request is sent somewhere other than the routes above,
  // send it through our custom error handler
  app.use(helpers.errorLogger);
  app.use(helpers.errorHandler);
};
