const mongoose = require('mongoose');

const password = encodeURIComponent('userid');
const url = `mongodb+srv://abishek:userid@cluster0.yd0ynwb.mongodb.net/test?retryWrites=true&w=majority&appName=password`;

mongoose.connect(url)
  .then(() => console.log('Connected to database'))
  .catch((err) => console.error('Error connecting to database:', err));
