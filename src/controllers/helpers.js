const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.tokenTypes = {
  SESSION: 'SESSION',
  REGISTRATION_VERIFICATION: 'REGISTRATION_VERIFICATION',
  PASSWORD_CHANGE_VERIFICATION: 'PASSWORD_CHANGE_VERIFICATION',
};

exports.userRoles = {
  OWNER: 'owner',
  ADMIN: 'admin',
  SELLER: 'seller',
};

exports.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};
