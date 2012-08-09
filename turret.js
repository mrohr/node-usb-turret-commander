var HID = require('../node-hid/build/Release/HID');
var DOWN    = 0x01;
var UP      = 0x02;
var LEFT    = 0x04;
var RIGHT   = 0x08;
var FIRE    = 0x10;
var STOP    = 0x20;
var device;
var isMoving = false;
function send_cmd(cmd){
    device.write([0x02, cmd, 0x00,0x00,0x00,0x00,0x00,0x00]);
}

function run_time_cmd(cmd,param,callback){
  callback = callback ? callback: function(){};
  if(!param){
      param = cmd == 'shoot' ? 1 : 1000;
  }
  console.log(cmd);
  console.log(isMoving);
  if(cmd == 'stop'){
    isMoving = false;
    send_cmd(STOP);
    callback(null);
    return;
  }
  if(isMoving){
    callback('Command Already Running');
    return;
  }
  isMoving = true;
  switch(cmd){
    case 'up':
      send_cmd(UP);
      setTimeout(function(){run_time_cmd('stop',null,callback)},param);
      break;
    case 'down':
      send_cmd(DOWN);
      setTimeout(function(){run_time_cmd('stop',null,callback)},param);
      break;
    case 'left':
      send_cmd(LEFT);
      setTimeout(function(){run_time_cmd('stop',null,callback)},param);
      break;
    case 'right':
      send_cmd(RIGHT);
      setTimeout(function(){run_time_cmd('stop',null,callback)},param);
      break;
    case 'shoot':
      if(param > 4){
        param = 4;
      }
      send_cmd(SHOOT);
      for(var i=1; i<=param;i++){
        if(i < param){
          setTimeout(function(){send_cmd(SHOOT)},4000*i);
        }else{
          setTimeout(function(){run_time_cmd('stop',null,callback)},4000*i);
        }
      }
      break;
  }  
}
function setup(){
    console.log(HID.devices());
    var devices = HID.devices();
    var path;
    for(key in devices){
      var dev = devices[key];
      if(dev.product == 'USB Missile Launcher'){
        path = dev.path;
      }
    }
    console.log(path);
    if(!path){
      console.log('No Launcher Detected!!!');
      //process.exit();
    }else{
    device = new HID.HID(path);
    }
}
function runCommandlineListener(){
    rint = require('readline').createInterface( process.stdin, {} ); 
    rint.input.on('keypress',function( char, key) {
        console.log(key);
        if( key == undefined ) {
            process.stdout.write('{'+char+'}')
        } else {
          console.log(key.name);
          var offset = 1675;
            if( key.name == 'escape' ) {
                process.exit();
            }
            if( key.name == 'enter' ) {
                send_cmd(STOP);
            }
            if( key.name == 'left' ) {
                run_time_cmd('left',1600);
            }
            if( key.name == 'right' ) {
                run_time_cmd('right',1600);
            }
            if( key.name == 'up' ) {
                send_cmd(UP);
            }
            if( key.name == 'down' ) {
                send_cmd(DOWN);
            }
            if( key.name == 'space' ) {
                send_cmd(FIRE);
            }
        }
    });
    require('tty').setRawMode(true);
}
function getDevice(){return device};
exports.device = getDevice;
exports.setup = setup;
exports.run_time_cmd = run_time_cmd;
exports.send_cmd = send_cmd;
exports.UP = UP;
exports.DOWN = DOWN;
exports.LEFT = LEFT;
exports.RIGHT = RIGHT;
exports.FIRE = FIRE;
exports.STOP = STOP;
//setup();
//runCommandlineListener();
//down 1000
/*
run_time_cmd('left',1720,function(err){
    if(err){
        console.log(err);
    }else{
        //run_time_cmd('right',10);
    }
});
*/