const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const { connectdb } = require('./src/db');
const authRoute = require('./src/routes/auth');
require('dotenv').config({ path: './.env' });

const app = express();

const PORT = process.env.PORT;

// Connect DB
connectdb();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routing
app.use('/api/auth/', authRoute);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
