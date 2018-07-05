var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser= require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var mongoose =require('mongoose');
var socket = require('socket.io');
var cors = require('cors');
const parseArgs = require('minimist')(process.argv.splice(1));
var cache = require('express-redis-cache')(); 
var cronautoWork = require('./cronWork/cronAutoWork');
var cronautoWorkYoutube = require('./cronWork/youtubeAutoWork');
var winston = require('./config/winston/winston.config');
var dbfile = require('./config/DB/DbHost');
var passportSetup = require('./config/socialLogin/passport-auth');
var passport = require('passport');
var config = require('config');
var cookieSession = require('cookie-session');
var hashSecret = require(`./config/hashPasswordSecret/hashpass`);
const configDev = require ("./config")




var app = express();
app.get("/", function (req, res) {
  res.send("Server running on " + IP  + ":" + PORT)
})
var routes = require('./routes/routeController');

// all use
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json()); 
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false })); 

app.use(passport.initialize());
app.use(passport.session());



app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('combined',{ stream: winston.stream }));

app.use(cookieSession({
  maxAge: 24*60*60*1000,
  keys:hashSecret.COOKIESESSIONCODE
}));



app.use("/" ,routes);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});




//db connection      
mongoose.connect(dbfile.DBHOST ,() => { console.log('DB connected'); });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

if(config.util.getEnv('NODE_DEV')!='test'){

  app.use(morgan('combined',{ stream: winston.stream }));
}

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  //  this line to include winston logging
  //winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`); 
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

console.log('My Key', configDev.key1);
console.log('Environemnt Check ',process.env.NODE_ENV);
console.log('Args',process.argv);
console.log("parseArgs",parseArgs);

const IP = parseArgs.ip || "127.0.0.1";
const PORT = parseArgs.PORT || 3001;

console.log("IP",IP,"Port",PORT);
var server = app.listen(PORT,IP,() =>{
  console.log(`backend started at port : ${PORT} and IP : ${IP}`);
});
server;

//socket setup
var io = socket(server);

io.on('connection',function(socket){
  //winston.info('made socket connection');

    socket.on('chat',function(data) {
      winston.info('data rx',data)
        io.sockets.emit('chat',data)
    });
    

    socket.on('join',function(data) {
      socket.join(data.email)
    });

    
});

console.log("START ", IP, PORT)



module.exports =server;
module.exports = app;
