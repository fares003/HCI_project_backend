const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../model/users'); // Import the User model

const listsSchema = new Schema({
  listname: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item", // Reference the "Item" schema
    },
  ],
});

module.exports = mongoose.model('List', listsSchema);
