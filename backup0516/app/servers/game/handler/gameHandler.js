/**
 * Created by wuningjian on 2/22/16.
 */
var crypto = require('crypto');
var gameDao = require("../../../dao/gameDao");
var delayDao = require("../../../dao/delayDao");
var gameLogicRemote = require("../remote/gameLogicRemote");
var gameRemote = require("../remote/gameRemote");

module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
};

var handler = Handler.prototype;

//var gameRemote = require('../remote/gameRemote.js');

handler.game_process = function(msg,session,next){
    console.log("gameHandler gameProcess"+JSON.stringify(msg));
    var self = this;
    var rid = session.get('rid');
    var uid = session.uid;
    //session.set('readyNum',);
    var username = session.uid.split('*')[0];

    var channelService = this.app.get('channelService');
    var channel = channelService.getChannel(rid, false);

    //用户发来的msg的游戏处理信息
    var process = msg.process;

    //收到发牌准备消息，然后处理进行发牌
    if(process == 'ready'){
        //console.log('player ready');
        //var param = {
        //    route:'onReady',
        //    user:username
        //    //processType:'ready'
        //};
        //channel.pushMessage(param);
        ////gameDao.addReadyNum()
        //var readyNum = session.get('readyNum');
        //session.set('readyNum',readyNum+1);
        //session.push('readyNum',function(err){
        //    if(err){
        //        console.error('gameHandler:set readyNum for session service failed! error is : %j', err.stack);
        //    }
        //});
        //
        //console.log("readyNum:"+session.get('readyNum'));
        //next(null,{
        //    msg:"receive process successfully"
        //
        //});
    }else if(process == 'follow'){
        console.log('player follow');

        //var args="app_id=123&access_token=abc";
        //var app_secret="123456";
        //var sign=crypto.createHmac('sha1', app_secret).update(args).digest().toString('base64');
        //console.log('----------crypto---------:'+sign);

        /**
         * param:rid,msg.location,channel,username
         * */
        gameDao.getAllinMark(rid,function(err,allin_mark){
            if(allin_mark==0){
                /**
                 * param:rid,msg.location,channel,username
                 * */
                gameLogicRemote.follow(rid,msg.location,channel,username);
            }
        });
        

        next(null,{
            msg:"receive process successfully"
        });
    }else if(process == 'add'){
        console.log('player add');

        /**
         * param:rid,msg.add_chip,msg.location,channel
         * */
        gameDao.getAllinMark(rid,function(err,allin_mark){
            if(allin_mark==0){
                /**
                 * param:rid,msg.add_chip,msg.location,channel
                 * */
                gameLogicRemote.add(rid,msg.add_chip,msg.location,channel,username);
            }
        });

        next(null,{
            msg:"receive process successfully"

        });

    }else if(process == 'open'){
        console.log('player open');

        /**
         * param:rid,msg.location,channel
         * */

        gameLogicRemote.open(rid,msg.location,channel,username);

        next(null,{
            msg:"receive process successfully"

        });

    }else if(process == 'throw'){
        console.log('player throw');
        /**
         * param:rid,msg.location,channel,username,channelService
         * */

        gameLogicRemote.throw(rid,msg.location,channel,username,channelService);

        next(null,{
            msg:"receive process successfully"

        });
    }else if(process == 'allin'){
        console.log('player allin');
        console.log('msg'+JSON.stringify(msg));

        gameLogicRemote.allin(rid,msg.location,channel,username);

        next(null,{
            msg:"receive process successfully"

        });

    }else if(process == 'bipai'){
        console.log('player bipai');
        gameLogicRemote.bipai(rid,msg.location1,msg.location2,channel,username,function(winner){
            var param = {
                route:'onBipai',
                position1:msg.location1,
                position2:msg.location2,
                //user:username
                winner:winner
            };
            channel.pushMessage(param);

            if(winner==msg.location1){
                gameDao.cleanOpenMark(rid,msg.location2,function(err){});
            }else if(winner==msg.location2){
                gameDao.cleanOpenMark(rid,msg.location1,function(err){});
            }else{
                console.error("gameHandler_bipai:return winner error");
            }

            //更改当前出牌玩家
            gameDao.nextCurPlayer(rid,function(err){
                console.log("nextCurPlayer success");
                gameDao.getIsGameNum(rid,function(err,isGameNumArr){
                    var sum = 0;
                    var game_winner;
                    for(var i=1;i<6;i++){
                        if(isGameNumArr[i]==1){
                            sum = sum +isGameNumArr[i];
                            game_winner=i;
                            //console.log("winner:"+game_winner);
                        }
                    }
                    if(sum<=1){
                        //重新开始

                        gameLogicRemote.restartGame(rid,channel,channelService,game_winner,username);


                    }
                });
            });

        });

        next(null,{
            msg:"receive process successfully"

        });


    }else if(process == 'getRoomInfo'){
        gameDao.getRoomInfo(rid,function(err,res){

            next(null,res);
        });
    }else if(process == 'getPlayerInfo'){
        var app1 = this.app;
        gameRemote(app1).get(uid,channel,channelService,function(result){
            //console.log('---------=============-----------'+result);
            next(null,result);
        });
    }
    else if(process == 'huanPai'){
        console.log('---------huanpai:---------');
        gameLogicRemote.huanPai(rid,msg.location,msg.paiToChange,function(err,new_pai){
            if(err!=null){
                next('huan pai failed!',null);
            }else{
                console.log('---------huanpai:---------:'+JSON.stringify(new_pai));
                next(null,new_pai);
            }
        });
        //console.log('---------huanpai:---------:'+JSON.stringify(new_pai));
        //next(null,new_pai);
    }else if(process == 'quitRoom'){
        console.log('----------quitRoom--------');
        //session, session.uid, app.get('serverId'), session.get('rid'), null
        this.app.rpc.game.gameRemote.kick(session,session.uid,"connector-server-1",session.get('rid'),function(){
            next(null,'kick successful');
        });

    }
    else{
        console.log("Process invalid!");
        next(null,{
            msg:"receive process error"

        });
    }
    //next(null,{
    //    msg:"receive process successfully"
    //
    //});
};