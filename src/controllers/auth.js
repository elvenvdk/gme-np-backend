const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/user');
const db = require('../db');

/**
 * @function validateEmail
 * @description checks if email address syntax is valid
 */

const validateEmail = (email) => {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) return true;
  return false;
};

/**
 * @function register
 * @description register new user
 */

exports.register = async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;
  if (email === '' || password === '')
    return res.status(400).json({ error: 'Email and password are required' });

  if (!validateEmail(email))
    return res
      .status(400)
      .json({ error: 'Please enter a valid email address...' });
  try {
    let user = await User.find({ email });
    if (user.length)
      return res.status(400).json({ error: 'User already registered' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });
    await user.save();
    res.send({ msg: 'User successfully registered' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
