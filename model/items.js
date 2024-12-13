const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../model/users'); // Import the User model

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photo: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  list: { type: mongoose.Schema.Types.ObjectId, ref: "List", required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  reviews: [
    {
      review: { type: String, required: true },
      owner: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
      createdAt: { type: Date, default: Date.now }, 
      rating:{type:Number,required:false}
    },
  ],
});


module.exports = mongoose.model('Item', itemSchema);
