import mongoose from 'mongoose';
// Define mongo schema
var MultiGameSchema = new mongoose.Schema({
  user1: Object,
  user2: Object,
  active: Boolean,
  id: {
    type: String,
    required: true
  },
  // user1 and user2 are booleans that state whether user is ready
  // to start multiplayer race
  user1: {
    type: Boolean,
    default: false
  },
  user2: {
    type: Boolean,
    default: false
  },
  // canceled is a boolean that states whether one of the users has
  // cancled during a multiplayer match. The current application does not
  // consider this boolean and needs to be implemented.
  canceled: {
    type: Boolean,
    default: false
  },
  won: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('multiGame', MultiGameSchema);
