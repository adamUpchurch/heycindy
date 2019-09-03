var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var express_session = require('express-session')
var indexRouter = require('./routes/index');
var mongoDBStore = require('connect-mongodb-session')(express_session)

require('dotenv').config();

var {MongoDB, session}       = require('./config/keys');

var mongoDB = MongoDB.dbURI ? MongoDB.dbURI : `${process.env.MONGO_DB_UI}?retryWrites=true`

var app = express();
var store = new mongoDBStore({
  uri: MongoDB.uri ? MongoDB.uri : process.env.MONGO_DB_UI,
  collection: 'sessions'
})
//Set up mongoose connection
var mongoose = require('mongoose')
mongoose.connect(mongoDB, {useNewURLParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  express_session({secret: session.cookieKey ? session.cookieKey : process.env.COOKIE_KEY, resave: false, saveUninitialized: false, store: store})
  )


app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
