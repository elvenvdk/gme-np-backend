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
  const { firstName, lastName, email, password, role } = req.body;
  console.log(firstName, lastName, email, password, role);
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

/**
 * @function login
 * @description user login
 */

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log({ email });
  if (email === '' || password === '')
    return res.status(400).json({ error: 'Email and password are required' });
  try {
    const user = await User.findOne({ email });
    console.log({ user });
    if (!user) return res.status(400).json({ error: 'User not found' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ error: 'Invalid email or password' });

    // res.send(user.id);
    const payload = {
      id: user.id,
      role: user.role,
    };

    // Get user role
    if (user.role === 'admin') {
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        async (err, token) => {
          if (err) throw err;
          await user.update({ $set: { sessionToken: token } });
          return res.send({ msg: 'Admin user successfully logged in', token });
        },
      );
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1w' },
      async (err, token) => {
        if (err) throw err;
        await user.update({ $set: { sessionToken: token } });
        res.send({ msg: 'Sales person successfully logged in' });
      },
    );
  } catch (error) {
    res.status(400).json({ error: error.stack });
  }
};
