var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var firebase = require("firebase");


var Session = require('express-session');


var app = express();


app.use(Session({
    secret: 'asdqwe123456',
    saveUnInitialized: true,
    resave: true
}));




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Pagina no encontrada');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


// Initialize Firebase
var config = {
    apiKey: "AIzaSyC5ouRHubv0yrN21gyR4F8EYkXbKaIGnxE",
    authDomain: "sharic1-a4df6.firebaseapp.com",
    databaseURL: "https://sharic1-a4df6.firebaseio.com",
    projectId: "sharic1-a4df6",
    storageBucket: "sharic1-a4df6.appspot.com",
    messagingSenderId: "225171417559"
};
firebase.initializeApp(config);


module.exports = app;
