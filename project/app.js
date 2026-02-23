createError = require('http-errors');
express = require('express');
path = require('path');
cookieParser = require('cookie-parser');
logger = require('morgan');
passport = require('passport');
pool = require('./db.js')
session = require(`express-session`);
mysqlStore = require(`express-mysql-session`)(session);
mysql = require(`mysql2`);

indexRouter = require('./routes/index');
articlesRouter = require('./routes/articles');
supportRouter = require('./routes/support');
aboutRouter = require('./routes/about');
authRouter = require('./routes/auth');
app = express();

const sessionStore = new mysqlStore({} , pool);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: `keyboard cat`,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
})
);

app.use(passport.initialize());
app.use(passport.session(sessionStore));


app.use('/', indexRouter);
app.use('/articles',articlesRouter);
app.use('/support', supportRouter);
app.use('/about', aboutRouter);
app.use('/', authRouter);

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
