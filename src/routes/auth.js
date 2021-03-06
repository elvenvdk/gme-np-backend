const express = require('express');
const {
  register,
  login,
  emailVerificationCheck,
  forgotPassword,
  forgotPasswordVerification,
  registerOwner,
  sellerInstanceVerificationCheck,
  logout,
  lockoutComplete,
  userLogout,
} = require('../controllers/auth');

const router = express.Router();

/**
 * @route api/auth/register
 * @description registration route for admin and sellers
 * @access public
 */

router.post('/register', register);

/**
 * @route api/auth/owner-registration
 * @description registration route for owners
 * @access public
 */

router.post('/owner-registration', registerOwner);

/**
 * @route api/auth/login
 * @description Login in for all users
 * @access public
 */

router.post('/login', login);

/**
 * @route api/auth/logout
 * @description Log current user out
 * @access private
 */

router.post('/logout', logout);

/**
 * @route api/auth/userLogout
 * @description Log user out
 * @access private
 */

router.post('/userLogout', userLogout);

/**
 * @route api/auth/lockout
 * @description Lock user out
 * @access private
 */

router.post('/lockout', lockoutComplete);

/**
 * @route api/auth/email-verification
 * @description Route for verififying user email upon after registration
 * @access private
 */

router.post('/email-verification', emailVerificationCheck);

/**
 * @route api/auth/seller-instance-verification
 * @description Route for verififying user email upon after registration
 * @access private
 */

router.post(
  '/seller-instance-verification/:userName',
  sellerInstanceVerificationCheck,
);

/**
 * @route api/auth/forgot-password
 * @description Route for sending forgot-password verification and token setting for user
 * @access public
 */

router.post('/forgot-password', forgotPassword);

/**
 * @route api/auth/forgot-password-verification
 * @description Route for verifying user email for forgot-password
 * @access private
 */

router.post('/forgot-password-verification', forgotPasswordVerification);

module.exports = router;
