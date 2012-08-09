var HID = require('node-hid');
var DOWN    = 0x01;
var UP      = 0x02;
var LEFT    = 0x04;
var RIGHT   = 0x08;
var FIRE    = 0x10;
var STOP    = 0x20;
var device;
var isMoving = false;
var isFireing = false;
var isPreping = false;

function setup(){
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
      process.exit();
    }else{
    device = new HID.HID(path);
    }
}

function send_cmd(cmd){
    device.write([0x02, cmd, 0x00,0x00,0x00,0x00,0x00,0x00]);
}
function send_move(cmd){
    if(!isFireing && !isPreping){
      send_cmd(cmd);
    }
}

function run_time_cmd(cmd,param,callback){
  callback = callback ? callback: function(){};
  if(!param){
      param = cmd == 'shoot' ? 1 : 1000;
  }
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

function primeFire(callback){
  isPreping = true;
  console.log('PRIME');
  send_cmd(FIRE);
  setTimeout(function(){
    send_cmd(STOP);
    isPreping = false;
    if(callback){
      callback();
    }
  },600);
}

function fire(callback){
  if(!isFireing && !isPreping){
    isFireing = true;
    send_cmd(FIRE);
    setTimeout(function(){
      isFireing = false;
      send_cmd(STOP);
      primeFire(callback);
    },3000);
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
                send_cmd(LEFT);
            }
            if( key.name == 'right' ) {
                send_cmd(RIGHT);
            }
            if( key.name == 'up' ) {
                send_cmd(UP);
            }
            if( key.name == 'down' ) {
                send_cmd(DOWN);
            }
            if( key.name == 'space' ) {
                fire();
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
exports.fire = fire;
exports.send_move = send_move; 