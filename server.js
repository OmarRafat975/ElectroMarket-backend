/* eslint-disable no-console */

// .env link
require('dotenv').config();

// Data Base Connection
const mongoose = require('mongoose');

// Handling Uncaught Exception
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('💥UNHANDLED EXCEPTION! SHUTTING DOWN...');
  process.exit(1);
});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose.connect(DB).then(() => console.log('DB Connection is Successful!'));

// Server Starting
const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app listening on port: ${port}`);
});

// Handling Unhandled Rejection
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('💥UNHANDLED REJECTION! SHUTTING DOWN...');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. SHUTTING DOWN gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});
