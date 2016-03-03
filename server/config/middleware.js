import morgan from 'morgan';
import bodyParser from 'body-parser';

import fb from '../utils/facebook.js';

const middleware = (app, express) => {
  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(express.static(`${__dirname}/../../client`));
  fb.fbAuth();
};

export default middleware;
