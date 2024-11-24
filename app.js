const express = require('express');
const morgan = require('morgan');

// importing Routers
const productRouter = require('./routes/productRoutes');

const app = express();
const api = process.env.API_V;

//MiddleWares
app.use(express.json());
app.use(morgan('tiny'));

app.use(`${api}/products`, productRouter);

module.exports = app;
