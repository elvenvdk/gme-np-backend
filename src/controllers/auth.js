const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Session = require('../models/session');
const Org = require('../models/org');
const Goal = require('../models/goals');

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
  const {
    firstName,
    lastName,
    userName,
    email,
    password,
    role,
    org,
    orgName,
  } = req.body;
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

    // Check if user isn't the org owner
    if (org && role === userRoles.OWNER)
      return res
        .status('400')
        .json({ error: 'An organization ownder already exists' });

    let userOrg = await Org.findOne({ name: orgName });
    if (!userOrg)
      return res
        .status(400)
        .json({ error: 'This organization does not exist' });

    // Hash and salt user password
    const hashedPassword = await hashPassword(password);

    // Add new user
    user = new User({
      firstName,
      lastName,
      userName,
      email,
      role,
      org: userOrg._id,
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
      { expiresIn: role === 'seller' ? '1w' : '1h' },
      async (err, token) => {
        if (err) return res.status(400).json({ error: err.message });
        userSession.token = token;
        await userSession.save();

        const link = `${process.env.FRONTEND_URL}/auth/registration-email-verification/${token}`;
        const sellerLink = `${process.env.GE_NP_S_FRONTEND}/registration-email-verification/${token}`;

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
             <p>${role === 'seller' ? sellerLink : link}</p>
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
    res.status(400).json({ error: 'There was a problem adding this user.' });
  }
};

/**
 * @function registerOwner
 * @description Registers new organization owner.  Sends user email apon successful registration
 * @param {*} req firstName, lastName, email, password, role, org
 * @param {*} res confirmation msg
 */

exports.registerOwner = async (req, res) => {
  const {
    firstName,
    lastName,
    userName,
    email,
    password,
    role,
    orgName,
  } = req.body;
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
      userName: ''
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

        const link = `${process.env.FRONTEND_URL}/auth/registration-email-verification/${token}`;

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
    res.status(400).json({ error: 'There was a problem adding this user.'  });
  }
};

/**
 * @function login
 * @description Logs user in
 * @param {*} query email password
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

    const session = await Session.findOne({ user: user._id });

    if (!session) res.status(401).json({ error: 'Password not valid' });
    const valid = await bcrypt.compare(password, session.password);
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password' });

    const org = await Org.findOne({ _id: user.org });
    if (!org)
      return res.status(400).json({
        error:
          'You are not associated with any organization yet.  Please see the an admin personnel or the organization owner.',
      });

    const goal = await Goal.findOne({ org: org._id });
    if (!goal)
      console.log({
        msg: 'No goal found... Moving to construct token payload.',
      });

    // res.send(user.id);
    const payload = {
      id: user.id,
      role: user.role,
      orgName: org.name,
      orgId: org._id,
    };

    // Get user role
    if (user.role !== userRoles.SELLER) {
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        async (err, token) => {
          if (err) throw err;
          session.token = token;
          await session.save();
          return res.send({
            msg: 'Admin user successfully logged in',
            token: session.token,
            id: user.id,
            role: user.role,
            orgName: org.name,
            orgId: org.id,
            goalId: goal && goal.id,
          });
        },
      );
    }

    if (user.role === userRoles.SELLER) {
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1w' },
        async (err, token) => {
          if (err) throw err;
          session.token = token;
          await session.save();
          res.send({ msg: 'Sales person successfully logged in' });
        },
      );
    }
  } catch (error) {
    res.status(400).json({ error: error.stack });
  }
};

/**
 * @function logout
 * @description Logs user out
 * @param {*} query userId
 * @param {*} req
 * @param {*} res confirmation msg
 */

exports.logout = async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user)
      return res
        .status(400)
        .json({ error: 'There was a problem logging this user out' });
    const session = await Session.findOne({ user: user._id });
    if (!session)
      return res.status(400).json({ error: 'User session not found' });
    session.token = '';
    await session.save();
    res.send({ msg: 'User session successfully ended' });
  } catch (error) {
    res
      .status(400)
      .json({ error: 'There was an error with logging this user out' });
  }
};

/**
 * @function logout
 * @description Logs user out
 * @param {*} query userId
 * @param {*} req
 * @param {*} res confirmation msg
 */

exports.userLogout = async (req, res) => {
  const { eamil } = req.query;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ error: 'There was a problem logging this user out' });
    const session = await Session.findOne({ user: user._id });
    if (!session)
      return res.status(400).json({ error: 'User session not found' });
    session.token = '';
    await session.save();
    res.send({ msg: `${user.name}'s session has successfully ended` });
  } catch (error) {
    res
      .status(400)
      .json({ error: 'There was an error with logging this user out' });
  }
};

/**
 * @function logout
 * @description Logs user out
 * @param {*} query userId
 * @param {*} req
 * @param {*} res confirmation msg
 */

exports.lockoutComplete = async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ error: 'There was a problem locking this user out' });
    const session = await Session.findOne({ user: user._id });
    if (!session)
      return res.status(400).json({ error: 'User session not found' });
    session.token = '';
    session.password = '';
    await session.save();
    res.send({ msg: 'User session complete lockout - successfull' });
  } catch (error) {
    res
      .status(400)
      .json({ error: 'There was an error with logging this user out' });
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
    const userSession = await Session.findOne({ token });

    if (!userSession)
      return res
        .status(401)
        .json({ error: 'There was a problem verifying this email.' });

    const user = await User.findOne({ _id: userSession.user });
    if (!user) return res.status(401).json({ error: 'User not found.' });

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

    const newToken = await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: user.role === userRoles.SELLER ? '1w' : '2h',
    });

    userSession.token = newToken;
    await userSession.save();
    res.send({
      msg: 'Your email has been successfully verified.',
      token,
      id: decoded.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: decoded.role,
      org: decoded.org,
    });
  } catch (error) {
    res
      .status(401)
      .json({ error: 'There was a problem verifying this email.' });
  }
};

/**
 * @function sellerInstanceVerificationCheck
 * @description Gets token from email verification to check if user has verified email
 * @param {*} query token
 * @param {*} req
 * @param {*} res confirmation msg
 */

exports.sellerInstanceVerificationCheck = async (req, res) => {
  const { userName } = req.params;
  if (!userName)
    return res.status(400).json({ error: 'Username not provided' });
  try {
    let user = await User.findOne({ userName });
    if (!user) return res.status(400).json({ error: 'Sales origin not found' });
    let org = await Org.findOne({ _id: user.org });
    if (!org)
      return res
        .status(400)
        .json({ error: 'Fundrasing organization not found' });
    let session = await Session.findOne({ user: user._id });
    if (!session) res.status(400).json({ error: 'Session not found' });
    let decoded = jwt.verify(session.token, process.env.JWT_SECRET);
    if (!decoded)
      return res.status(401).json({ error: 'This session has expired' });
    res.send({
      msg: 'App session successfully verified.',
      org: org._id,
      orgName: org.name,
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      token: session.token,
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
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
