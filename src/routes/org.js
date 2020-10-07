const express = require('express');
const { addOrg, updateOrg, getOrgs } = require('../controllers/org');
const router = express.Router();

router.post('/add', addOrg);

router.put('/update', updateOrg);

router.get('/', getOrgs);
module.exports = router;
