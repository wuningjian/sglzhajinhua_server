/**
 * Created by wuningjian on 3/7/16.
 */
//reference http://blog.csdn.net/xufeng0991/article/details/46654159

//module.exports = function(app) {
//    return new Cron(app);
//};
//var Cron = function(app) {
//    this.app = app;
//};
//
//
//Cron.prototype.rank = function() {
//    console.log('game rank');
//};
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