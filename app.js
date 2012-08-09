
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var turret = require('./turret');
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
turret.setup();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
io.sockets.on('connection',function(socket){
  if(turret.device()){
    socket.emit('new-conn',{status:'OK'});
  }else{
    socket.emit('no-device');
  }
  socket.on('status-check',function(data){
    if(turret.device){
      socket.emit('new-conn',{status:'OK'});
    }else{
      socket.emit('no-device');
    }
  });
  socket.on('turret-event',function(data){
    console.log(data.cmd);
    console.log(turret);
    if(turret.device()){
    turret.send_cmd(turret[data.cmd]);
    }else{
      socket.emit('no-device');
    }
  });
  socket.on('disconnect', function () { 
    process.exit(0);
  });

});
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
  var spawn = require('child_process').spawn
  spawn('open', ['http://localhost:' + app.get('port')]);
});
