const mongoose = require('mongoose');

const password = encodeURIComponent('abishek1');
const url = '';

mongoose.connect(url)
  .then(() => console.log('Connected to database'))
  .catch((err) => console.error('Error connecting to database:', err));
