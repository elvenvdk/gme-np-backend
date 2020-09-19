const express = require('express');
const { addOrg } = require('../controllers/org');
const router = express.Router();

router.post('/add', addOrg);

module.exports = router;
