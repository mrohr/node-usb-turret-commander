
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , sockets = require('./sockets');

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


turret.setup();
var server = http.createServer(app);
sockets.setup(server,turret);
sockets.onDisconnect(function(){
  console.log('disconnectCallback');
  routes.connection(false);
});
app.get('/', routes.index);
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
  var spawn = require('child_process').spawn
  spawn('open', ['http://localhost:' + app.get('port')]);
});
