const mongoose = require('mongoose');

const NON_PROFIT_DB = process.env.NON_PROFIT_DB;

exports.connectdb = async () => {
  try {
    const db = await mongoose.connect(NON_PROFIT_DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    console.log('Database connected...');
  } catch (error) {
    console.log(error.stack);
  }
};
