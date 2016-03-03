import passport from 'passport';
import Strategy from 'passport-facebook';
import {FACEBOOK_APP_ID, FACEBOOK_APP_SECRET} from './facebookEnv.js';
import Promise from 'bluebird';

export default {
  fbAuth(cb) {
    new Promise(function(resolve, reject) { 
      passport.use(new Strategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: 'http://localhost:8000/auth/facebook/callback',
      },
      function(accessToken, refreshToken, profile) {
        if (!accessToken || !refreshToken || !profile) {
          reject();
        }
        resolve(accessToken, refreshToken, profile, cb);
      }
      ));
    })
    .then(function(accessToken, refreshToken, profile) {
      cb(accessToken, refreshToken, profile);
    });
  }
};

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
