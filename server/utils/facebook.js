const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

import {FACEBOOK_APP_ID, FACEBOOK_APP_SECRET} from './facebookEnv.js';
import Promise from 'bluebird';

const fbAuth = (cb) => {
  passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: 'http://localhost:8000/auth/facebook/callback',
  //profileFields: ['id', 'displayName', 'photos', 'email'],
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
  ));
};


export default {
  fbAuth: fbAuth,
  fbAuthRoute: passport.authenticate('facebook', { scope: ['user_friends', 'manage_pages'] }),
  fbAuthCbRoute: passport.authenticate('facebook', { failureRedirect: '/login' }),
};

 // auth via facebook


// export default {
//   fbAuth(cb) {
//     passport.use(new Strategy({
//         clientID: FACEBOOK_APP_ID,
//         clientSecret: FACEBOOK_APP_SECRET,
//         callbackURL: 'http://localhost:8000/auth/facebook/callback',
//       },
//       function(accessToken, refreshToken, profile) {
//         cb(accessToken, refreshToken, profile);
//       }
//     ));
//   },

//   test() {
//     this.fbAuth(function(accessToken, refreshToken, profile) {
//       console.log(accessToken, refreshToken, profile);
//     });
//   },
// };
