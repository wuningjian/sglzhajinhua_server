/**
 * Created by wuningjian on 4/15/16.
 */
var gBroadcastDao = module.exports;
var pomelo = require('pomelo');
var utils   = require('../util/utils');
var sqlTemp = pomelo.app.get('dbclient');

gBroadcastDao.createRow = function(){

};

gBroadcastDao.getRowByType = function(type,cb){
    var type1 =type;
    if(type1 == 'null'){
        type1 = 1;
    }
    var sql = 'select * from game_broadcast where broadcast_type = ?';
    var args =[type1];
    sqlTemp.query(sql,args,function(err,res){
        if(err!==null){
            utils.invokeCallback(cb,'db gBroadcastDao:getRowByType error',null);
        }else{
            var length = res.length;
            utils.invokeCallback(cb,null,res[Math.floor(Math.random()*length)].broadcast_content);
        }
    });
};