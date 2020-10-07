const user = require('../models/user');

const jwt = require('jsonwebtoken');

exports.userId = async (req, res, next) => {
  const token = req.header('x-auth-token');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded)
      return res.status(401).json({ error: 'User session is not valid' });

    res.locals.userId = decoded.id;
    next();
  } catch (error) {
    res.status(400).json({ error: 'User ID is not valid' });
  }
};
