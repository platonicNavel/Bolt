const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

import {FACEBOOK_APP_ID, FACEBOOK_APP_SECRET} from './facebookEnv.js';
import userController from '../users/userController.js';

const fbAuth = () => {
  passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: 'http://localhost:8000/auth/facebook/callback',
  profileFields: ['id', 'first_name', 'last_name', 'email', 'picture'],
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log('facebook auth success!');
    profile.facebook = true;
    cb(null, profile);
  }
  ));
  passport.serializeUser(function(user, cb) {
    cb(null, user);
  });
  passport.deserializeUser(function(user, cb) {
    cb(null, user);
  });
};

export default {
  fbAuth: fbAuth,
  fbAuthRoute: passport.authenticate('facebook', { scope: ['user_friends', 'manage_pages'] }),
  fbAuthCbRoute: passport.authenticate('facebook', { failureRedirect: '/signin' }),
};
