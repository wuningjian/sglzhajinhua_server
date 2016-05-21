/**
 * Created by wuningjian on 4/14/16.
 */
module.exports = function(app) {
    return new Cron(app);
};
var Cron = function(app) {
    this.app = app;
};


Cron.prototype.infoForLogin = function() {
    //console.log('login cron');
    var channelService = this.app.get('channelService');
    //stype, route, msg, opts, cb
    channelService.broadcast('connector','onLoginBroadcast','test broadcast in login cron',null,function(err){
        if(err){
            console.log(err);
        }
    });
};