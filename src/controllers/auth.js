const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Session = require('../models/session');
const { tokenTypes, hashPassword, userRoles } = require('./helpers');
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
 * @description Registers new user.  Sends user email apon successful registration
 * @param {*} req firstName, lastName, email, password, role, org
 * @param {*} res confirmation msg
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
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already registered' });

    // Hash and salt user password
    const hashedPassword = await hashPassword(password);

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
      tokenType: tokenTypes.REGISTRATION_VERIFICATION,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      async (err, token) => {
        if (err) return res.status(400).json({ error: err.message });
        userSession.token = token;
        await userSession.save();

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
 * @description Gets organization goalPerDay amount
 * @param {*} query orgId
 * @param {*} req
 * @param {*} res confirmation msg
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
    if (user.role === userRoles.ADMIN) {
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

/**
 * @function emailVerificationCheck
 * @description Gets token from email verification to check if user has verified email
 * @param {*} query token
 * @param {*} req
 * @param {*} res confirmation msg
 */

exports.emailVerificationCheck = async (req, res) => {
  const { token } = req.query;
  try {
    const userSession = Session.findOne({ token });
    if (!userSession)
      return res
        .status(401)
        .json({ error: 'There was a problem verifying this email.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded)
      return res
        .status(401)
        .json({ error: 'Your verification session has expired.' });

    const payload = {
      id: decoded.id,
      role: decoded.role,
      org: decoded.org,
      tokenType: tokenTypes.SESSION,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '2h' },
      async (err, token) => {
        if (err) return res.status(400).json({ error: err.message });
        userSession.token = token;
        await userSession.save();
        res.send({
          msg: 'Your email has been successfully verified.',
          token,
          id: decoded.id,
          role: decoded.role,
          org: decoded.org,
        });
      },
    );
  } catch (error) {
    res
      .status(401)
      .json({ error: 'There was a problem verifying this email.' });
  }
};

/**
 * @function forgotPassword
 * @description Sends user email for forgotPasswordVerification
 * @param {*} req body email
 * @param {*} res confirmation msg
 */

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(400)
        .json({ error: 'There was a problem finding your account' });

    const userSession = await Session.findOne({ user: user._id });

    if (!userSession)
      return res
        .status(400)
        .json({ error: 'There was a problem finding your account' });

    const payload = {
      id: user._id,
      role: user.role,
      org: user.org,
      tokenType: tokenTypes.PASSWORD_CHANGE_VERIFICATION,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '2h' },
      async (err, token) => {
        if (err) return res.status(400).json({ error: err.message });

        userSession.token = token;
        console.log({ USER_SESSION: userSession.token });
        await userSession.save();

        const link = `${process.env.FRONTEND_URL}/forgot-password-verification?token=${token}`;

        // Send user confirmation/verification email with token link
        sendMail({
          from: 'contact@grandmaemmas.com',
          to: email,
          subject: "No-Reply - Grandma Emma's - Forgot Password Verification",
          text: "Grandma Emma's verify that you forgot your password",
          html: `<p>Hi ${user.firstName}</p>
             <p>This is an email verifying that you forgot your password.</p>
             <p>Please click the link below to verify your email.</p>
             <br></br>
             <p>${link}
             <br></br>
             <p>Thank you,</p>
             <p>Grandma Emmas Team`,
        });

        res.send({
          msg:
            'We have a sent a change-password verification email.  Please check your email and follow the link provided.',
        });
      },
    );
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @function forgotPasswordVerification
 * @description Gets token from email to check if user has password verification token in db
 * @param {*} query token
 * @param {*} req
 * @param {*} res confirmation msg
 */

exports.forgotPasswordVerification = async (req, res) => {
  const { token } = req.query;
  try {
    const userSession = Session.find({ token });
    if (!userSession)
      return res
        .status(401)
        .json({ error: 'There was a problem verifying this email.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded)
      return res
        .status(401)
        .json({ error: 'Your verification session has expired.' });

    const payload = {
      id: decoded.id,
      role: decoded.role,
      org: decoded.org,
      tokenType: tokenTypes.SESSION,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '2h' },
      (err, token) => {
        if (err) return res.status(400).json({ error: err.message });
        userSession.token = token;
        res.send({
          msg: 'Your email has been successfully verified.',
          token,
          id: decoded.id,
          role: decoded.role,
          org: decoded.org,
        });
      },
    );
  } catch (error) {
    res
      .status(401)
      .json({ error: 'There was a problem verifying this email.' });
  }
};

/**
 * @function tokenVerify
 * @description Verifies token from frontend and compares to session token in db
 * @param {*} query token
 * @param {*} req header
 */

exports.tokenVerify = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if token exists
  if (!token)
    return res.status(401).json({ error: 'No token, authorization denied' });

  // Verify token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.ID = decoded.id;
    res.locals.ROLE = decoded.role;
    res.locals.ORG = decoded.org;
    next();
  } catch (err) {
    res
      .status(401)
      .json({ error: 'Token is not valid', error_msg: err.message });
  }
};
