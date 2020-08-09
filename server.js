const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('.env').config({ path: './.env' });

const app = express();
