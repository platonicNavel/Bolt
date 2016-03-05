import User from './userModel.js';
import Q from 'q';
import jwt from 'jwt-simple';
import helpers from '../config/helpers';

// Promisify a few mongoose methods with the `q` promise library
const findUser = Q.nbind(User.findOne, User);
const createUser = Q.nbind(User.create, User);
const updateUserDB = Q.nbind(User.update, User);

export default {

  // Sign a user in
  signin(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    // see if they exist...
    findUser({ email })
    .then((user) => {
      if (!user) {
        // ...if we can't find them, throw error
        next(new Error('User does not exist'));
      } else {
        // ...if we can, check the password
        return user.comparePasswords(password)
        .then((foundUser) => {
          if (foundUser) {
            const token = jwt.encode(user, 'secret');
            res.json({
              token,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username,
              phone: user.phone,
              preferredDistance: user.preferredDistance,
              runs: JSON.stringify(user.runs),
              achievements: JSON.stringify(user.achievements),
            });
          } else {
            return next(new Error('No user'));
          }
        });
      }
    })
    .fail((error) => {
      next(error);
    });
  },

  signup(req, res, next) {
    console.log('authenticating... hold on.', req.user, req.body);
    const email = req.body.email;
    const username = req.body.email;
    const password = req.body.password;

    // check to see if user already exists
    findUser({ email })
    .then((user) => {
      if (user) {
        next(new Error('User already exist!'));
      }
      else if (req.user) {
        const facebookUser = {
          facebook: true,
          firstName: req.user.name.givenName,
          lastName: req.user.name.familyName,
          email: req.user.emails[0].value,
          id: req.user.id,
        };
        console.log('routed!', facebookUser);
        const user = createUser({
          facebook: true,
          email: facebookUser.email,
          username: facebookUser.firstName+facebookUser.lastName,
          password: facebookUser.id,
          firstName: facebookUser.firstName,
          lastName: facebookUser.lastName,
        });
        // res.redirect('/#/createProfile');
        return user;
      }
      else {
        // make a new user if not one
        return createUser({
          facebook: false,
          email,
          username,
          password,
        });
      }
    })
    .then((user) => {
      // create token to send back for auth
      const token = jwt.encode(user, 'secret');
      console.log(user.facebook);
      if (user.facebook) {
        res.redirect('/#/createProfile/token='+token);
        return;
      }
      else {
        res.json({
          token: token,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          preferredDistance: user.preferredDistance,
          runs: JSON.stringify(user.runs),
          achievements: JSON.stringify(user.achievements)
        });
      }
    })
    .fail((error) => {
      next(error);
    });
  },

  updateUser(req, res, next) {
    // This is tied to createProfile on the frontend, so users can update
    // their info
    console.log(req.body);
    const newData = req.body.newInfo;
    const username = req.body.user.username;
    const user = {
      username,
    };

    // search the DB for the specific user
    const queryCondition = { username };

    findUser(user)
    .then((user) => {
      if (user) {
        return updateUserDB(queryCondition, newData);
      }
      next(new Error('No user found!'));
    })
    .fail((error) => {
      next(error);
    });
  },

  getUser(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) {
      next(new Error('No token'));
    } else {
      const user = jwt.decode(token, 'secret');
      findUser({ email: user.email })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.send(404);
      });
    }
  },

  checkAuth(req, res, next) {
    // checking to see if the user is authenticated
    // grab the token in the header is any
    // then decode the token, which we end up being the user object
    // check to see if that user exists in the database
    const token = req.headers['x-access-token'];
    if (!token) {
      next(new Error('No token'));
    } else {
      const user = jwt.decode(token, 'secret');
      findUser({ email: user.email })
      .then((foundUser) => {
        if (foundUser) {
          res.send(200);
        } else {
          res.send(401);
        }
      })
      .fail((error) => {
        next(error);
      });
    }
  },
};
