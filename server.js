const express = require('express');
const cors = require('cors');

const { connectGremsdb } = require('./src/db/gremsdb');

require('dotenv').config({ path: './.env' });

const app = express();

const PORT = process.env.PORT;

// Connect DB
connectGremsdb();

// Middleware
app.use(cors());

// Routing

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
