var createError = require('http-errors');
var express = require('express');
var path = require('path');
const session=require('express-session')
const {v4:uuidv4} = require('uuid')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expbs= require('express-handlebars')
var nocache = require('nocache')
const hbsHelpers = require('./helpers/registerHelpers')
require('dotenv').config()



var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');



var app = express();

const hbs = expbs.create({
  extname:'hbs',defaultLayout:'layout',
  layoutsDir:__dirname+'/views/layout/',
  partialsDir:__dirname+'/views/partials/',
  
  helpers:{
    ifEquals:hbsHelpers.ifEquals,
    wishlistHeartIcon:hbsHelpers.wishlistHeartIcon,  
    indexing:hbsHelpers.indexing,
     goToCart:hbsHelpers.goToCart,
     checkPaymentMethod:hbsHelpers.checkPaymentMethod
  }
})

var db=require('./confg/connection')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine)

app.use(nocache())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(
  {secret:'key',cookie:{maxAge:600000}}
))

db.connect((err)=>{
  if(err) console.log("connection failed");
 else  console.log("database connected") ;
})



app.use('/', usersRouter);
app.use('/admin', adminRouter);

app.get('/admin/*',(req,res)=>{
  res.render('admin/error')
})

app.get('/*',(req,res)=>{
  res.render('user/error',{noFooter:true})
})







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
