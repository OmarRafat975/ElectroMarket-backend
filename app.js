/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
// const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
const hpp = require('hpp');

// importing Routers
const productRouter = require('./routes/productRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const usersRouter = require('./routes/usersRoutes');
const ordersRouter = require('./routes/ordersRoutes');
// const authJwt = require('./helpers/jwtAuth');
const errorHandler = require('./helpers/errorHandler');
const AppError = require('./helpers/appError');

const app = express();
const api = process.env.API_V;

// CORS FOR Frontend Requests
app.use(cors());
// app.options('*', cors());

//MiddleWare

if (process.env.NODE_ENV === 'development') app.use(morgan('tiny'));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later',
});
// app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// app.use(mongoSanitize());

// app.use(xss());
app.use(hpp());

// app.use(authJwt());
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
