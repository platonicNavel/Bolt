import passport from 'passport-facebook';
import Q from 'q';

const fb = Q.nbind(passport.use, passport);

var fbAuth = function(cb) {
  fb.use(new FacebookStrategy({
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: 'http://localhost:8000/auth/facebook/callback',
    },
    function(accessToken, refreshToken, profile) {
      User.findOrCreate({ facebookId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  ));
};

var test = function() {
  fbAuth(function(err, user) {
    if (err) {console.error(err);}
    console.log(user);
  });
};

export default fb;
