const express = require('express');
const { addOrg, updateOrg, getOrgs } = require('../controllers/org');
const router = express.Router();
const { tokenVerify } = require('../middleWare/auth');

router.post('/add', tokenVerify, addOrg);

router.put('/update', tokenVerify, updateOrg);

router.get('/', tokenVerify, getOrgs);
module.exports = router;
