/**
 * Created by wuningjian on 3/7/16.
 */
//reference http://blog.csdn.net/xufeng0991/article/details/46654159

var gBroadcastDao = require("../../../dao/gBroadcastDao");

module.exports = function(app) {
    return new Cron(app);
};
var Cron = function(app) {
    this.app = app;
};


Cron.prototype.infoForGame = function() {
    //console.log('game rank');
    var channelService = this.app.get('channelService');
    //stype, route, msg, opts, cb
    gBroadcastDao.getRowByType('null',function(err,broadcast_content){
        if(err!==null){
            console.error(err);
        }else{
            channelService.broadcast('connector','onActBroadcast',broadcast_content,null,function(err){
                //console.log('game rank');
                if(err){
                    console.error(err);
                }
            });
        }

    });

};
//
//
////crons.json
////
//{
//    "development":{
//    "game": [
//        {"id": 1, "time": "0 0/1 * * * *", "action": "rankCron.rank"}
//    ]
//},
//    "production":{
//    "game": [
//        {"id": 1, "time": "0 0/1 * * * *", "action": "rankCron.rank"}
//    ]
//}
//}