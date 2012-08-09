
/*
 * GET home page.
 */
var connection = false;
exports.connection = function(con){
  console.log('connection setter');
  console.log(con);
  if(typeof(con) != 'undefined'){
    connection = con;
  }
  console.log(connection);
  return connection;
}
exports.index = function(req, res){
  console.log(connection);
  if(connection){
    res.render('deny', { title:'Connection Denied'});
  }else{
    connection = true;
    res.render('index', { title: 'Turret Commander' });
  }
};