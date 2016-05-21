/**
 * Created by wuningjian on 4/18/16.
 */

var playerDao = require('../../../dao/playerDao');

module.exports = function(app){
    return new Broadcast(app)
};

var Broadcast = function(app){
    this.app = app;
};

/**
 *
 * @param msg
 * @param session
 * @param next
 */
Broadcast.prototype.sendMes = function(msg,session,next){
    var channelService = this.app.get('channelService');
    var playerId = session.get('playerId');
    console.log('--------'+playerId+'-------');
    playerDao.getPlayerByPlayerId(playerId,function(err,player){
        if(err!==null){
            next(null,{
                code:404,
                msg:"send message fail"
            });
        }else{
            var sendMes;
            if(player.vip!=0){
                //stype, route, msg, opts, cb
                //channelService.broadcast('game','onUserBroadcast',msg,null,function(){
                //    if(err){
                //        next(null,{
                //            code:404,
                //            msg:"send message fail"
                //        });
                //    }else{
                //        next(null,{
                //            code:500,
                //            msg:"send message successfully"
                //        });
                //    }
                //});
                sendMes = {content:"vip"+player.vip+" "+player.nickName+":"+msg.content};
            }else{
                sendMes = {content:player.nickName+":"+msg.content};
            }
            channelService.broadcast('connector','onUserBroadcast',sendMes,null,function(){
                if(err){
                    next(null,{
                        code:404,
                        msg:"send message fail"
                    });
                }else{
                    next(null,{
                        code:500,
                        msg:"send message successfully"
                    });
                }
            });
        }
    });
    //console.log("content:"+msg.content);

};