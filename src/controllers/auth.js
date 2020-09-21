const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Session = require('../models/session');
const { sendMail } = require('../controllers/emailSvc');
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
  const { firstName, lastName, email, password, role, org } = req.body;
  if (email === '' || password === '')
    return res.status(400).json({ error: 'Email and password are required' });

  if (!validateEmail(email))
    return res
      .status(400)
      .json({ error: 'Please enter a valid email address...' });
  try {
    // Check if user exists
    let user = await User.find({ email });
    if (user.length)
      return res.status(400).json({ error: 'User already registered' });

    // Hash and salt user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Add new user
    user = new User({
      firstName,
      lastName,
      email,
      role,
      org,
    });

    await user.save();

    // Add user password to user session
    const userSession = await new Session({
      user: user._id,
      password: hashedPassword,
    });

    await userSession.save();

    // Create email verification token
    const payload = {
      id: user._id,
      role,
      org,
      tokenType: 'registration_verification',
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) return res.status(400).json({ error: err.message });
        userSession.token = token;

        const link = `${process.env.FRONTEND_URL}/registration-email-verification?token=${token}`;

        // Send user confirmation/verification email with token link
        sendMail({
          from: 'contact@grandmaemmas.com',
          to: email,
          subject: "No-Reply - Grandma Emma's Fund-Raising Registration",
          text: "Grandma Emma's Fund-Raising Program Registration",
          html: `<p>Hi ${firstName}</p>
             <p>This is a confirmation email from your registration to Grandma Emma's Fund-Raising Program</p>
             <p>Please click the link below to verify your email.</p>
             <br></br>
             <p>${link}
             <br></br>
             <p>Thank you and Welcome,</p>
             <p>Grandma Emmas Team`,
        });
      },
    );

    res.send({
      msg:
        "Registration successfull.  We've emailed you a confirmation.  If it's not in your inbox it might be in your spam folder.",
    });
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
  if (email === '' || password === '')
    return res.status(400).json({ error: 'Email and password are required' });
  try {
    const user = await User.findOne({ email });

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
