const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../model/users'); // Import the User model

const itemsSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "List",
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

module.exports = mongoose.model('Item', itemsSchema);
