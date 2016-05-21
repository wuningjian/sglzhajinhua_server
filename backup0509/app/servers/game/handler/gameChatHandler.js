/**
 * Created by wuningjian on 4/8/16.
 */
module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
};

var handler = Handler.prototype;

handler.sendMes = function(msg,session,next){
    console.log("--------===========-------chat.chatHandler.send");
    var rid = session.get('rid');
    console.log("--------==================rid"+rid);

    var channelService = this.app.get('channelService');
    var channel = channelService.getChannel(rid, false);

    //var param = {
    //    route:'onChatInGame',
    //    content:msg.content
    //};
    channel.pushMessage('onChatInGame',msg);

    next(null, {
        route: '已发送'
    });
};