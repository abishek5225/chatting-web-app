const mongoose = require('mongoose');
require('dotenv').config();


mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('Connected to database'))
  .catch((err) => console.error('Error connecting to database:', err));

  module.exports = mongoose;