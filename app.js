const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

// importing Routers
const productRouter = require('./routes/productRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const usersRouter = require('./routes/usersRoutes');
const ordersRouter = require('./routes/ordersRoutes');

const app = express();
const api = process.env.API_V;

// CORS FOR Frontend Requests
app.use(cors());
// app.options('*', cors());

//MiddleWare
app.use(express.json());
app.use(morgan('tiny'));

//Routers
app.use(`${api}/products`, productRouter);
app.use(`${api}/category`, categoryRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);

module.exports = app;
