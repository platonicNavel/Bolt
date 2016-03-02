import jwt from 'jwt-simple';

export default {

  // Get user from db and return a promise with access to that user
  applyToUser(user) {
    if ((typeof user) === 'string') {
      user = { username: user };
    }
    return findUser({ username: username })
    .then(function (user) {
      if (!user) {
        next(new Error('User does not exist'));
      } else {
        return user;
      }
    });
  },

  // Log errors when appropriate
  errorLogger(error, req, res, next) {
    console.error(error.stack);
    next(error);
  },
  errorHandler(error, req, res, next) {
    res.send(500, { error: error.message });
  },

  // Used for authentication
  decode(req, res, next) {
    const token = req.headers['x-access-token'];
    let user;

    if (!token) {
      return res.send(403); // send forbidden if a token is not provided
    }

    try {
      user = jwt.decode(token, 'secret');
      req.user = user;
      next();
    } catch (error) {
      return next(error);
    }
  }
};
