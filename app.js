const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

// importing Routers
const productRouter = require('./routes/productRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const usersRouter = require('./routes/usersRoutes');
const ordersRouter = require('./routes/ordersRoutes');
const authJwt = require('./helpers/jwtAuth');
const errorHandler = require('./helpers/errorHandler');
const AppError = require('./helpers/appError');

const app = express();
const api = process.env.API_V;

// CORS FOR Frontend Requests
app.use(cors());
// app.options('*', cors());

//MiddleWare
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
//Routers
app.use(`${api}/products`, productRouter);
app.use(`${api}/category`, categoryRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);

app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find  ${req.originalUrl} on This Site`, 404));
});

app.use(errorHandler);

module.exports = app;
