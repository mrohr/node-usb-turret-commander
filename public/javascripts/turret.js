$(document).ready(function(){
  var socket = io.connect('/');
  var mouseX;
  var mouseY;
  var isFiring = false;
  socket.on('new-conn', function (data) {
    console.log(data);
    if(data.status == 'OK'){
      enableTurret();
    }else{
      noTurret();
    }
  });
  socket.on('no-device',noTurret);
  socket.on('firing-turret',function(){
    isFiring = true;
    drawOverlay();
  });
  socket.on('finished-firing',function(){
    isFiring = false;
    drawOverlay();
  });

  function noTurret(){
    $('#turret').removeClass('online');
    drawOverlay();
    setTimeout("socket.emit('status-check')",5000);
  }
  function enableTurret(){
    $('#turret').addClass('online');
    if($('#camera').hasClass('online')){
      $('#control-sound')[0].play();
    }
    drawOverlay();
  }
  window.resetCursor = function(){
    mouseX = undefined;
    mouseY = undefined;
    drawOverlay();
  }
  function enableCamera(){
    $('#camera').addClass('online');
    if($('#turret').hasClass('online')){
      $('#control-sound')[0].play();
    }
    resizeVideo();
  }
  var keys = new Array();
  keys[32] = 'FIRE';
  keys[37] = 'LEFT';
  keys[38] = 'UP';
  keys[39] = 'RIGHT';
  keys[40] = 'DOWN';

  var prevKey = undefined;
  $('body').keydown(function(e){
    var key = keys[e.keyCode];
    if($('#turret').hasClass('online') &&  key != prevKey){
      socket.emit('turret-event',{cmd:key});
      prevKey = key;
    }
    if(e.keyCode == 87){
      mouseY = mouseY - 5;
      drawOverlay();
    }
    if(e.keyCode == 83){
      mouseY = mouseY + 5;
      drawOverlay();
    }
    if(e.keyCode == 65){
      mouseX = mouseX - 5;
      drawOverlay();
    }
    if(e.keyCode == 68){
      mouseX = mouseX + 5;
      drawOverlay();
    }
  });
  $('body').keyup(function(e){
    if($('#turret').hasClass('online') &&  keys[e.keyCode] != 'FIRE'){
      socket.emit('turret-event',{cmd:'STOP'});
    }
    prevKey = undefined;
  });

  window.URL = window.URL || window.webkitURL;
  navigator.getUserMedia  = navigator.getUserMedia || 
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia || 
                            navigator.msGetUserMedia;

  var video = document.querySelector('video');
  if (navigator.getUserMedia) {
    navigator.getUserMedia({audio: false, video: true}, function(stream) {
      video.src = window.URL.createObjectURL(stream);
    }, function(){});
  } else {
    $('p').html('Video Not Supported');
  }
  function resizeVideo(){
    console.log('resize video');
    actualRatio = video.videoWidth/video.videoHeight;
    targetRatio = $(video).width()/$(video).height();
    adjustmentRatio = targetRatio/actualRatio;
    $(video).css("-webkit-transform","scaleX(" + adjustmentRatio + ")");
    drawOverlay();
  }
  $(video).bind('loadedmetadata',function(){
    enableCamera();
  });
  $(window).resize(resizeVideo);
  $('#turret-overlay').click(function(e){
    console.log(e);
    mouseX = e.pageX;
    mouseY = e.pageY;
    drawOverlay();
  });
  function drawOverlay(){
    console.log('DRAW');
    var canvas = $('#turret-overlay');
    var ctx=canvas[0].getContext("2d");
    ctx.canvas.width  =canvas.width();
    ctx.canvas.height = canvas.height();
    ctx.clearRect( 0 , 0 , canvas.width() , canvas.height());
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(0,0,300,100);
    ctx.font = "20pt Helvetica";
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'black';
    ctx.fillText("Turret Commander", 5, 25);
    ctx.font = "15pt Helvetica";
    var status;
    if($('#turret').hasClass('online')){
      status = "Online";
      ctx.fillStyle = 'green';
    }else{
      status = "Offline";
      ctx.fillStyle = "red";
    }
    ctx.fillText("Turret Controls: " + status,20,50);
    if($('#camera').hasClass('online')){
      status = "Online";
      ctx.fillStyle = 'green';
    }else{
      status = "Offline";
      ctx.fillStyle = "red";
    }
    ctx.fillText("Camera: " + status,20,70);

    var x = canvas.width() / 2;
    var y = canvas.height() / 2;
    if($('#camera').hasClass('online')){
      
      var radius = canvas.width() / 30;
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'black';

      var cirY = y + (y*.75);
      var cirX = x;
      if(mouseX && mouseY){
        cirY=mouseY;
        cirX=mouseX;
      }
      ctx.beginPath();
      ctx.arc(cirX,cirY,radius,0,2 * Math.PI,false);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cirX,cirY,1,0,2 * Math.PI,false);
      ctx.stroke();
      }else{
        ctx.font = "40pt Helvetica";
        ctx.fillStyle = "black";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No Camera Found', x,y);
      }
      if(isFiring){
        ctx.font = "100pt Helvetica";
        ctx.fillStyle = "red";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('FIRING', x,y);
      }
  }
});

