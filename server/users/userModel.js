const Q = require('q');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const SALT_WORK_FACTOR = 10;


const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  salt: String,
  firstName: {
    type: String,
    default: 'Speedee',
  },
  lastName: {
    type: String,
    default: 'Gonzales',
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  phone: Number,
  preferredDistance: {
    type: Number,
    default: 1,
  },
  mileSpeed: {
    type: Number,  // in min/mile
    default: 10,
  },
  runs: {
    type: Array,
    default: [],
  },
  facebook: Boolean,

  personalBest: Number, // Personal best in min/mile
  achievements: {
    type: Object,
    default: { // Object of all lifetime medals received
      Gold: 0,
      Silver: 0,
      Bronze: 0,
      'High Five': 0,
      Iron: 0, // experimental
    },
  },
});

UserSchema.methods.comparePasswords = function(candidatePassword) {
  const savedPassword = this.password;
  return Q.Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, savedPassword, (err, isMatch) => {
      if (err) {
        reject(err);
      } else {
        resolve(isMatch);
      }
    });
  });
};

UserSchema.pre('save', function(next) {
  let user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) {
      return next(err);
    }

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) {
        return next(err);
      }

      // override the cleartext password with the hashed one
      user.password = hash;
      user.salt = salt;
      next();
    });
  });
});

export default mongoose.model('users', UserSchema);
