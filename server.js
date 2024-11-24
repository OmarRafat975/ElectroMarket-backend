/* eslint-disable no-console */

// .env link
require('dotenv').config();

// Data Base Connection
const mongoose = require('mongoose');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose.connect(DB).then(() => console.log('DB Connection is Successful!'));

// Server Starting
const app = require('./app');

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app listening on port: ${port}`);
});
