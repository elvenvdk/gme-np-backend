const express = require('express');
const { addOrg, updateOrg } = require('../controllers/org');
const router = express.Router();

router.post('/add', addOrg);

router.put('/update', updateOrg);

module.exports = router;
