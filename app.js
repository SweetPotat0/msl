console.log("Requiring modules...");
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var io = require('socket.io')();

var routes = require('./routes/index');

console.log("Beggining Stream ...");

var app = express();
app.io = io;
var monitorConn = false;
var minecraftConn = false;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

console.log('Building socket connection..');
io.on('connection',function(socket){
    console.log('Client connected..');
    socket.on("MonitorConnected",function(data){
        io.emit("Mon");
        monitorConn = true;
        console.log("Monitor Connected");
    });
    socket.on("MonitorDisconnected",function(){
        io.emit("MonOff");
        monitorConn = false;
        minecraftConn = false;
        console.log("Monitor Disconnected");
    });
    socket.on("IsMon",function(){
        if(monitorConn)
            socket.emit("Mon");
    });
    socket.on("IsMine",function(){
        if(minecraftConn)
            socket.emit("Mine");
    });
    socket.on("Mine",function(){
        minecraftConn = true;
        io.emit("Mine");
    });
    socket.on("MineOffMon",function(){
        minecraftConn = false;
        io.emit("MineOff");
    });
    socket.on("StartPro",function(){
        if(monitorConn && !minecraftConn){
            io.emit("StartProc");
            console.log("Starting Minecraft Remotely server");
        }
    });
    /*socket.on("PlayerConnec",function(data){
        socket.broadcast.emit('playerConn',data);
    });
    socket.on("updateToPlayer",function(data){
        io.to(data.socID).emit('updatePlay',data);
    });
    socket.on("Rotating",function(data){
        socket.broadcast.emit("Rotate",data);
    });
    socket.on("Moving",function(data){
        socket.broadcast.emit("Move",data);
    });
    socket.on("playerDisconn",function(data){
        io.emit("playerDiscon",data);
    });
    socket.on("message",function(data){
        io.emit("sendMessage",data);
    });
    */
});
console.log("Handling HTTP errors..");
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
console.log("Setting up environment..");
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
