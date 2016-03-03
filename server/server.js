import express from 'express';
import mongoose from 'mongoose';
import Promise from 'bluebird';

import fb from './utils/facebook.js'; // fb custom middleware

import middleware from './config/middleware.js';
import routes from './config/routes.js';

const app = express();
// ========================================
// Connect to local mongodb named "bolt"
// Uncomment line 9 to use a local database
// Be sure to re-comment line 9 when submitting PR
// mongoose.connect('mongodb://localhost/bolt');
// ========================================

// ========================================
// Connect to mongolab database
// Please replace this line with your own
//  mongolab link
// mongoose.connect('mongodb://heroku_l3g4r0kp:61docmam4tnk026c51bhc5hork@ds029605.mongolab.com:29605/heroku_l3g4r0kp');

mongoose.connect('mongodb://127.0.0.1:27017');
// ========================================

new Promise(function(resolve, reject) {
  fb.fbAuth(function(a,b,c) {
    console.log(a,b,c);
  })
});

middleware(app, express);
routes(app, express);

// start listening to requests on port 8000
const port = Number(process.env.PORT || 8000);
app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});


// export our app for testing and flexibility, required by index.js
export default app;
