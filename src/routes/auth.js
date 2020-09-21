const express = require('express');
const {
  register,
  login,
  emailVerificationCheck,
} = require('../controllers/auth');

const router = express.Router();

/**
 * @route api/auth/register
 * @description registration route for admin and sellers
 * @access public
 */

router.post('/register', register);

router.post('/login', login);

router.post('/email-verification', emailVerificationCheck);

module.exports = router;
