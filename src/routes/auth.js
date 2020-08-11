const express = require('express');
const { register } = require('../controllers/auth');

const router = express.Router();

/**
 * @route api/auth/register
 * @description registration route for admin and sellers
 * @access public
 */

router.post('/register', register);

module.exports = router;
