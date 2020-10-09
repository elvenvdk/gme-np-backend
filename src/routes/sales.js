const express = require('express');
const { getSales } = require('../controllers/sales');

const { tokenVerify } = require('../middleWare/auth');

const router = express.Router();

/**
 *
 */
router.get('/', tokenVerify, getSales);

module.exports = router;
