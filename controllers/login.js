const User=require('../model/users')

const bcrypt = require("bcrypt");

require("dotenv").config();

const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Username and password are required." });
      
  const foundUser =await User.findOne({email}).exec();

  if (!foundUser) return res.sendStatus(401); //Unauthorized
  // evaluate password
  const match = await bcrypt.compare(password, foundUser.password);

  if (match) {

    res.json({status:200, firstname:foundUser.firstname,lastname:foundUser.lastname,email:foundUser.email,id:foundUser._id });

  } else {
    res.sendStatus(401);
  }
};

module.exports = { handleLogin };
