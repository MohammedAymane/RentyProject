const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const defaultUser = require("../config/default.json").username;
const defaultPassword = require("../config/default.json").password;
const defaultId = require("../config/default.json").id;
const verify = require("../verification/verify");

// Validation

const Joi = require("@hapi/joi");

const schema_login = Joi.object({
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
});

let Token = [];

// login the user
router.post("/", async (req, res) => {
  // Validate data before login the user
  
  if(req.body.email==defaultUser & req.body.password==defaultPassword){
    const token = jwt.sign(
      { _id: defaultId },
      require('../config/default.json').jwtSecret
    );
    Token[0] = token;
    res.header("auth-token", token).send(Token[0]);
  }
  const { error } = schema_login.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if the user exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email doesn't exist");

  // Check if the password is valid
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Invalid password");

  // Create and assign a token to the user
  const token = jwt.sign(
    { _id: user._id },
    require('../config/default.json').jwtSecret
  );
  Token[0] = token;
  res.header("auth-token", token).send("signed in");
  //res.header("auth-token", token).send(Token[0]);
});

router.delete("/",verify, (req, res) => {
  Token[0] = "";
  res.send("token is deleted" );
});

module.exports = { router, Token };