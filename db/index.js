const { config } = require('../config');

const setupDBPromise =
  () => {
    const mongoose = require('mongoose');
    mongoose.Promise = global.Promise;

    return mongoose
      .connect(config.get('MONGO_URL'))
      .then(() => mongoose.connection)
      .catch(console.error.bind(console, 'DB connection error:'));
  };

module.exports = {
  setupDBPromise
};
