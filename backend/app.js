import 'dotenv/config';
import createError from 'http-errors';
import express, { json, urlencoded, static as expressStatic } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import calendarRouter from './routes/calendar.js';
import yelpRouter from './routes/yelp.js';
import TicketMasterRouter from './routes/TicketMaster.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// view engine setup
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressStatic(join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/yelp', yelpRouter);
app.use('/api/TicketMaster', TicketMasterRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error'); Ye helped, idk what this is doing
  if (req.accepts('json') || req.path.startsWith('/api/')) {
    return res.json({
      success: false,
      message: err.message,
      error: req.app.get('env') === 'development' ? err : {}
    });
  }
  res.render('error', (renderErr, html) => {
    if (renderErr) {
      res.type('txt').send(`Error: ${err.message}`);
    }
    else {
      res.send(html);
    }
  });
});

export default app;
// Collapse













