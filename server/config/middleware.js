import morgan from 'morgan';
import bodyParser from 'body-parser';
import passport from 'passport';

import fb from '../utils/facebook.js';

const middleware = (app, express) => {
  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(express.static(`${__dirname}/../../client`));
  app.use(passport.initialize());
  fb.fbAuth();
};

export default middleware;
