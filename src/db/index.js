const mongoose = require('mongoose');

const NON_PROFIT_DB = process.env.MLAB_URI;

exports.connectdb = async () => {
  try {
    await mongoose.connect(NON_PROFIT_DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    console.log('Database connected...');
  } catch (error) {
    console.log(error.stack);
  }
};
