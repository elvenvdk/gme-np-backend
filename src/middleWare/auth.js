const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Session = require('../models/session');

/**
 * @function tokenVerify
 * @description Verifies token from frontend and compares to session token in db
 * @param {*} query token
 * @param {*} req header
 */

exports.tokenVerify = async (req, res, next) => {
  const token = req.header('x-auth-token');
  // Check if token exists
  if (!token)
    return res
      .status(401)
      .json({ error: 'No user token provided.  Authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (!userId)
      return res
        .status(401)
        .json({ error: 'Invalid User ID.  Authorization denied' });
    const user = await User.findOne({ _id: userId });
    if (!user)
      return res
        .status(401)
        .json({ error: 'User not found. Authorization denied' });

    const session = await Session.findOne({ user: user._id });
    if (!session)
      return res
        .status(401)
        .json({ error: 'User session not found. Authorization denied' });

    if (token !== session.token)
      return res
        .status(401)
        .json({ error: 'Invalid session. Authorization denied' });

    next();
  } catch (error) {
    res.status(401).json({ error: 'Authorization denied' });
  }
};
