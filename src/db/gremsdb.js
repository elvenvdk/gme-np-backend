const mongoose = require('mongoose');

const GREMS_DB = process.env.GREMS_DB;

exports.connectGremsdb = async () => {
  try {
    const db = await mongoose.connect(GREMS_DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    console.log('Gremsdb connected...');
  } catch (error) {
    console.log(error.stack);
  }
};
