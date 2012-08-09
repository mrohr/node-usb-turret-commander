var io = require('socket.io');
var turret;
var disconnectCallback;
exports.io = function(){return io};
exports.onDisconnect = function(callback){
  disconnectCallback = callback;
}
exports.setup = function(server,tur){
  turret = tur;
  io = io.listen(server);
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
      if(turret.device()){
        if(data.cmd == 'FIRE'){
          socket.emit('firing-turret');
          turret.fire(function(){
            socket.emit('finished-firing');
          });
        }else if(data.cmd == 'PRIME'){
          socket.emit('firing-turret');
          turret.primeFire(function(){
            socket.emit('finished-firing');
          });
        }else{ 
          turret.send_move(turret[data.cmd]);
        }
      }else{
        socket.emit('no-device');
      }
    });
    socket.on('disconnect', function () { 
      if(disconnectCallback){
        console.log('disconnect');
        disconnectCallback();
      }
    });
  });
};