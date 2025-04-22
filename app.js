const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
// const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
// const hpp = require('hpp');

// importing Routers
const productRouter = require('./routes/productRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const usersRouter = require('./routes/usersRoutes');
const ordersRouter = require('./routes/ordersRoutes');
const cartRouter = require('./routes/cartRoutes');
const errorHandler = require('./helpers/errorHandler');
const AppError = require('./helpers/appError');

const app = express();
const api = process.env.API_V;

const allowedOrigins = [
  process.env.FRONT_URL,
  process.env.BACK_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:8080',
  'http://localhost:3000',
];

//MiddleWare

app.use((req, res, next) => {
  if (allowedOrigins.includes(req.headers.origin)) {
    res.header('Access-Control-Allow-Credentials', true);
  }
  next();
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

app.use(cookieParser());

if (process.env.NODE_ENV === 'development') app.use(morgan('tiny'));

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// app.use(mongoSanitize());

// app.use(xss());
// app.use(hpp());

//Routers
app.use(`${api}/products`, productRouter);
app.use(`${api}/category`, categoryRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/cart`, cartRouter);

app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find  ${req.originalUrl} on This Site`, 404));
});

app.use(errorHandler);

module.exports = app;
