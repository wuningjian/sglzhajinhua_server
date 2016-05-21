/**
 * Created by wuningjian on 3/3/16.
 */

var gameDao   = require('../../../dao/gameDao');
var playerDao = require('../../../dao/playerDao');
var delayDao  = require('../../../dao/delayDao');
var pomelo    = require('pomelo');
var async     = require('async');
var cache     = require('memory-cache');

var gameLogicRemote = module.exports;

gameLogicRemote.detect_gold = function(app,uid,channel,playerId,rid,cb){
    playerDao.getPlayerByPlayerId(playerId,function(err,playerInfo){
        if(err!==null){
            console.error("gameLogicRemote detect_gold error");
            cb();
        }else{
            gameDao.getRoomInfo(rid,function(err,roomInfo){
                if(err!==null){
                    console.error("gameLogicRemote detect_gold 1 error");
                    cb();
                }else{
                    var basicChip = roomInfo.basic_chip;
                    switch (basicChip){
                        case 100:
                            if(playerInfo.gold>=3000){
                                cb("permit");
                            }else{
                                //this.app.rpc.game.gameRemote.kick(session,session.uid,"connector-server-1",session.get('rid'),function(){
                                //    next(null,'kick successful');
                                //});
                                //if( !! channel) {
                                //    var users_ext = channel.getMembers();
                                //    console.log("------------users_ext:"+users_ext);
                                //    var abc = channel.leave(uid, sid);
                                //    console.log("------------leave status:"+abc);
                                //    var users = channel.getMembers();
                                //    console.log("------------users:"+users);
                                //}
                                if(!!channel){
                                    var abc = channel.leave(uid,"connector-server-1");
                                    if(abc==true){
                                        gameDao.rmPlayer(rid,uid,function(){
                                            var param = {
                                                route: 'onLeave',
                                                user: uid.split('*')[0]
                                            };
                                            channel.pushMessage(param);
                                            console.log("detect_gold rmPlayer succseefully");
                                            cb("refuse");
                                        });
                                    }
                                }


                            }
                            break;
                        case 500:
                            if(playerInfo.gold>=50000){
                                cb("permit");
                            }else{
                                if(!!channel){
                                    var abc = channel.leave(uid,"connector-server-1");
                                    if(abc==true){
                                        gameDao.rmPlayer(rid,uid,function(){
                                            var param = {
                                                route: 'onLeave',
                                                user: uid.split('*')[0]
                                            };
                                            channel.pushMessage(param);
                                            console.log("detect_gold rmPlayer succseefully");
                                            cb("refuse");
                                        });
                                    }
                                }

                            }
                            break;
                        case 1000:
                            if(playerInfo.gold>=100000){
                                cb("permit");
                            }else{
                                if(!!channel){
                                    var abc = channel.leave(uid,"connector-server-1");
                                    if(abc==true){
                                        gameDao.rmPlayer(rid,uid,function(){
                                            var param = {
                                                route: 'onLeave',
                                                user: uid.split('*')[0]
                                            };
                                            channel.pushMessage(param);
                                            console.log("detect_gold rmPlayer succseefully");
                                            cb("refuse");
                                        });
                                    }
                                }

                            }
                            break;
                        case 10000:
                            if(playerInfo.gold>=1000000){
                                cb("permit");
                            }else{
                                if(!!channel){
                                    var abc = channel.leave(uid,"connector-server-1");
                                    if(abc==true){
                                        gameDao.rmPlayer(rid,uid,function(){
                                            var param = {
                                                route: 'onLeave',
                                                user: uid.split('*')[0]
                                            };
                                            channel.pushMessage(param);
                                            console.log("detect_gold rmPlayer succseefully");
                                            cb("refuse");
                                        });
                                    }
                                }
                            }
                            break;
                        default:
                            cb("refuse");
                            break;
                    }
                }

            });
        }


    });
};

/**
 * fa pai
 * */
gameLogicRemote.fapai = function(app,uid,rid,channel,channelService,playerId,cb){
    ////如果name不存在且flag为true，则创建channel
    var users = channel.getMembers();
    console.log("--------users in fapai:"+users);
    for(var i = 0; i < users.length; i++) {
        users[i] = users[i].split('*')[0];
    }

    gameDao.getRoomInfo(rid,function(err,roomInfo){
        if(roomInfo.player_num>=2){
            //大于两人才执行发牌
            var j = Math.floor(Math.random()*users.length);
            gameDao.getPlayerLocal(rid,users[j],function(err,location){
                gameDao.setCurPlayer(rid,location,function(err,cur_player){
                    var param = {
                        route:'onFapai',//接受发牌消息
                        msg:"fapaile!",
                        first:users[j],  //返回第一个出牌的人
                        location:location
                    };
                    channel.pushMessage(param);
                });

                for(var i = 0; i<users.length; i++){
                    var playerId_int = parseInt(users[i]);
                    playerDao.subGold(playerId_int,100,function(err,res){
                        console.log('-------fapai subGold------');
                    });
                }

                //3000ms为发牌动作执行时间间隔
                setTimeout(function(){
                    gameLogicRemote.changeCurPlayer(rid,location,channel);
                },600*users.length);
            });

            //P:牌数字2-14
            //S:花色 1方块 2梅花 3红桃 4黑桃
            //这里需要完成发牌逻辑

            var paixing = gameLogicRemote.getCardArr(rid);

            //paixing = [
            //    //{p1:"13",p2:"13",p3:"13",s1:"1",s2:"2",s3:"4"},
            //    //{p1:"7",p2:"7",p3:"7",s1:"1",s2:"2",s3:"4"},
            //    {p1:"8",p2:"5",p3:"14",s1:"2",s2:"4",s3:"2"},
            //    {p1:"8",p2:"5",p3:"14",s1:"2",s2:"4",s3:"2"},
            //    {p1:"4",p2:"5",p3:"6",s1:"1",s2:"2",s3:"3"},
            //    {p1:"5",p2:"6",p3:"7",s1:"1",s2:"2",s3:"3"},
            //    {p1:"6",p2:"7",p3:"8",s1:"1",s2:"2",s3:"3"}
            //];

            var tempUser = channel.getMembers();
            gameDao.getAllChip(rid,function(err,ex_all_chip){
                gameDao.getCurrentChip(rid,function(err,cur_chip){
                    var new_chip = ex_all_chip+cur_chip*(tempUser.length);
                    gameDao.setAllChip(rid,new_chip,function(err){
                        console.log("fapai:new_chip:"+new_chip);
                        console.log("fapai:setAllChip success");
                    });
                });
            });


            for(var i=1;i<6;i++){
                gameDao.getLocalPlayer(rid,i,function(err,res,location){
                    if(res!='null'){
                        var param1 = {
                            paixing:paixing[location-1]
                        };
                        gameDao.updatePai(rid,paixing[location-1],location,function(err){

                        });
                        gameDao.setIsGameNum(rid,location,1,function(err){
                            console.log("paixing:"+JSON.stringify(param1));
                            console.log("heheheheheheh"+JSON.stringify(res));
                            var tsid = channel.getMember(res)['sid'];
                            channelService.pushMessageByUids('onShoupai', param1, [{
                                uid: res,
                                //sid: channel.getMember(res)['sid']
                                sid: tsid
                            }]);
                            gameDao.updateRoomStatus(rid,1,function(err){
                                console.log("game_status change to 1(gaming)");
                            });

                            delayDao.addDelay(rid,13,function(){
                                console.log("fapai:addDelay success");
                                //delayDao.removeDelay(rid,function(){
                                //    console.log("fapai:removeDelay success");
                                //});
                            });
                        });
                    }
                });
            }

            //reference :http://pomelo.netease.com/api.html
            //onShoupai接收牌型

            console.log("gamelogicRemote");


        }
    });

    cb();

    //gameDao.getRoomInfo(rid,function(err,roomInfo){
    //    async.parallel([
    //            function(callback){
    //                if(roomInfo.location1 != "null"){
    //                    var playerId = parseInt(roomInfo.location1.split('*')[0]);
    //                    gameLogicRemote.detect_gold(app,uid,channel,playerId,rid,function(data){
    //                        callback(null, data);
    //                    });
    //                }else{
    //                    callback(null, "null");
    //                }
    //            },
    //            function(callback){
    //                if(roomInfo.location2 != "null"){
    //                    var playerId = parseInt(roomInfo.location2.split('*')[0]);
    //                    gameLogicRemote.detect_gold(app,uid,channel,playerId,rid,function(data){
    //                        callback(null, data);
    //                    });
    //                }else{
    //                    callback(null, "null");
    //                }
    //            },
    //            function(callback){
    //                if(roomInfo.location3 != "null"){
    //                    var playerId = parseInt(roomInfo.location3.split('*')[0]);
    //                    gameLogicRemote.detect_gold(app,uid,channel,playerId,rid,function(data){
    //                        callback(null, data);
    //                    });
    //                }else{
    //                    callback(null, "null");
    //                }
    //            },
    //            function(callback){
    //                if(roomInfo.location4 != "null"){
    //                    var playerId = parseInt(roomInfo.location4.split('*')[0]);
    //                    gameLogicRemote.detect_gold(app,uid,channel,playerId,rid,function(data){
    //                        callback(null, data);
    //                    });
    //                }else{
    //                    callback(null, "null");
    //                }
    //            },
    //            function(callback){
    //                if(roomInfo.location5 != "null"){
    //                    var playerId = parseInt(roomInfo.location5.split('*')[0]);
    //                    gameLogicRemote.detect_gold(app,uid,channel,playerId,rid,function(data){
    //                        callback(null, data);
    //                    });
    //                }else{
    //                    callback(null, "null");
    //                }
    //            }
    //        ],
    //        function(err, results){
    //            //console.log("async parallel"+JSON.stringify(results[0]));
    //            //console.log("async parallel"+results);
    //            //channelService.pushMessageByUids('onInit',results,[{uid:uid,sid:sid}]);
    //            //return results;
    //            console.log("-------fapai----line 192");
    //
    //            gameDao.getRoomInfo(rid,function(err,roomInfo){
    //                if(roomInfo.player_num>=2){
    //                    //大于两人才执行发牌
    //                    var j = Math.floor(Math.random()*users.length);
    //                    gameDao.getPlayerLocal(rid,users[j],function(err,location){
    //                        gameDao.setCurPlayer(rid,location,function(err,cur_player){
    //                            var param = {
    //                                route:'onFapai',//接受发牌消息
    //                                msg:"fapaile!",
    //                                first:users[j],  //返回第一个出牌的人
    //                                location:location
    //                            };
    //                            channel.pushMessage(param);
    //                        });
    //
    //                        for(var i = 0; i<users.length; i++){
    //                            var playerId_int = parseInt(users[i]);
    //                            playerDao.subGold(playerId_int,100,function(err,res){
    //                                console.log('-------fapai subGold------');
    //                            });
    //                        }
    //
    //                        //3000ms为发牌动作执行时间间隔
    //                        setTimeout(function(){
    //                            gameLogicRemote.changeCurPlayer(rid,location,channel);
    //                        },600*users.length);
    //                    });
    //
    //                    //P:牌数字2-14
    //                    //S:花色 1方块 2梅花 3红桃 4黑桃
    //                    //这里需要完成发牌逻辑
    //
    //                    var paixing = gameLogicRemote.getCardArr(rid);
    //
    //                    //paixing = [
    //                    //    //{p1:"13",p2:"13",p3:"13",s1:"1",s2:"2",s3:"4"},
    //                    //    //{p1:"7",p2:"7",p3:"7",s1:"1",s2:"2",s3:"4"},
    //                    //    {p1:"8",p2:"5",p3:"14",s1:"2",s2:"4",s3:"2"},
    //                    //    {p1:"8",p2:"5",p3:"14",s1:"2",s2:"4",s3:"2"},
    //                    //    {p1:"4",p2:"5",p3:"6",s1:"1",s2:"2",s3:"3"},
    //                    //    {p1:"5",p2:"6",p3:"7",s1:"1",s2:"2",s3:"3"},
    //                    //    {p1:"6",p2:"7",p3:"8",s1:"1",s2:"2",s3:"3"}
    //                    //];
    //
    //                    var tempUser = channel.getMembers();
    //                    gameDao.getAllChip(rid,function(err,ex_all_chip){
    //                        gameDao.getCurrentChip(rid,function(err,cur_chip){
    //                            var new_chip = ex_all_chip+cur_chip*(tempUser.length);
    //                            gameDao.setAllChip(rid,new_chip,function(err){
    //                                console.log("fapai:new_chip:"+new_chip);
    //                                console.log("fapai:setAllChip success");
    //                            });
    //                        });
    //                    });
    //
    //
    //                    for(var i=1;i<6;i++){
    //                        gameDao.getLocalPlayer(rid,i,function(err,res,location){
    //                            if(res!='null'){
    //                                var param1 = {
    //                                    paixing:paixing[location-1]
    //                                };
    //                                gameDao.updatePai(rid,paixing[location-1],location,function(err){
    //
    //                                });
    //                                gameDao.setIsGameNum(rid,location,1,function(err){
    //                                    console.log("paixing:"+JSON.stringify(param1));
    //                                    console.log("heheheheheheh"+JSON.stringify(res));
    //                                    var tsid = channel.getMember(res)['sid'];
    //                                    channelService.pushMessageByUids('onShoupai', param1, [{
    //                                        uid: res,
    //                                        //sid: channel.getMember(res)['sid']
    //                                        sid: tsid
    //                                    }]);
    //                                    gameDao.updateRoomStatus(rid,1,function(err){
    //                                        console.log("game_status change to 1(gaming)");
    //                                    });
    //
    //                                    delayDao.addDelay(rid,13,function(){
    //                                        console.log("fapai:addDelay success");
    //                                        //delayDao.removeDelay(rid,function(){
    //                                        //    console.log("fapai:removeDelay success");
    //                                        //});
    //                                    });
    //                                });
    //                            }
    //                        });
    //                    }
    //
    //                    //reference :http://pomelo.netease.com/api.html
    //                    //onShoupai接收牌型
    //
    //                    console.log("gamelogicRemote");
    //
    //
    //                }
    //            });
    //
    //            cb();
    //        });
    //});


};

/**
 * 分牌逻辑，调用后返回牌型数组
 * */
gameLogicRemote.getCardArr = function(rid){
    var arr = [];
    var paiArr = [];//牌型数组
    var restPaiArr = [];//剩余的牌数组
    function convert (numArr){
        var p1 = parseInt(numArr[0]%13+2);
        var s1 = parseInt(numArr[0]/13+1);
        var p2 = parseInt(numArr[1]%13+2);
        var s2 = parseInt(numArr[1]/13+1);
        var p3 = parseInt(numArr[2]%13+2);
        var s3 = parseInt(numArr[2]/13+1);

        console.log('p1'+p1);
        console.log('s1'+s1);
        console.log('p2'+p2);
        console.log('s2'+s2);
        console.log('p3'+p3);
        console.log('s3'+s3);

        if(p1<p2){
            var temp = p1;
            var temp1 = s1;
            p1 = p2;
            s1 = s2;
            p2 = temp;
            s2 = temp1;
        }
        if(p2<p3){
            var temp = p2;
            var temp1 = s2;
            p2 = p3;
            s2 = s3;
            p3 = temp;
            s3 = temp1;
        }
        if(p1<p2){
            var temp = p1;
            var temp1 = s1;
            p1 = p2;
            s1 = s2;
            p2 = temp;
            s2 = temp1;
        }

        var param = {
            p1:p1.toString(),
            p2:p2.toString(),
            p3:p3.toString(),
            s1:s1.toString(),
            s2:s2.toString(),
            s3:s3.toString()
        };
        console.log("param"+JSON.stringify(param));
        return param;
    }

    for(var i=0;i<52;i++){
        arr[i]=0;
    }
    var j = 0;
    while (j<15){
        var temp=Math.floor(Math.random()*52);
        if(arr[temp]==0){
            arr[temp]=1;
            j++;
        }
    }
    console.log("arr:"+arr);

    var k=0;
    var t=0;
    for(var i=0;i<arr.length;i++){
        if(arr[i]==1){
            paiArr[k]=i;
            k++;
        }
        if(arr[i]==0){
            restPaiArr[t]=i;
            t++;
        }
    }

    cache.put(rid,restPaiArr);//剩余的牌存到缓存当中，关键字是房间号

    console.log("paiArr:"+paiArr);

    var paixing = [];

    paixing[0] = convert([paiArr[4],paiArr[5],paiArr[10]]);
    paixing[1] = convert([paiArr[3],paiArr[6],paiArr[11]]);
    paixing[2] = convert([paiArr[2],paiArr[7],paiArr[12]]);
    paixing[3] = convert([paiArr[1],paiArr[8],paiArr[13]]);
    paixing[4] = convert([paiArr[0],paiArr[9],paiArr[14]]);

    console.log("paixing:"+paixing);

    //var tempTest = 'wuningjian test';

    //cache.put('test',tempTest);

    return paixing;
};

/**
 * 处理换牌卡的逻辑
 * 若仍有换牌次数与换牌卡，则返回新的一张牌
 * 若没有换牌次数，则返回换牌次数不足
 * 若没有换牌卡，则返回换牌卡不足
 * @param rid
 * @param location
 * @param paiToChange eg.{p1:1,s1:1}
 * @param cb callback(err, newPai)
 */
gameLogicRemote.huanPai = function(rid,location,paiToChange,cb){
    //判断换牌卡数量剩余
    gameDao.getRoomInfo(rid,function(err,roomInfo){
        if(err!==null){
            cb('huanPai failed',null);
        }else{
            var playerId = null;
            switch (location){
                case 1:
                    playerId = roomInfo.location1.split('*')[0];
                    break;
                case 2:
                    playerId = roomInfo.location2.split('*')[0];
                    break;
                case 3:
                    playerId = roomInfo.location3.split('*')[0];
                    break;
                case 4:
                    playerId = roomInfo.location4.split('*')[0];
                    break;
                case 5:
                    playerId = roomInfo.location5.split('*')[0];
                    break;
                default:
                    //cb('huanPai failed',null);
            }
            playerDao.getPlayerByPlayerId(playerId,function(err,playerInfo){
                //获取换牌卡数量
                if(err!==null){
                    cb('huanPai failed',null);
                }else if(playerInfo.huanPaiKa<=0){
                    cb('换牌卡不足',null);
                }else{
                    //判断换牌次数
                    console.log('-----------enter gamelogicremote huanpai--------');
                    var restPaiArr = cache.get(rid);//剩余牌的数组
                    var index = Math.floor(Math.random()*restPaiArr.length);
                    var new_p1 = parseInt(restPaiArr[index]%13+2);
                    var new_s1 = parseInt(restPaiArr[index]/13+1);

                    //删除抽取的牌
                    restPaiArr[index]=restPaiArr[restPaiArr.length-1];
                    restPaiArr.pop();
                    cache.del(rid);
                    cache.put(rid,restPaiArr);

                    var newPai1 = {
                        p1:new_p1,
                        s1:new_s1
                    };
                    gameDao.getPai(rid,location,function(err,paixing){
                        console.log('-----------enter gamelogicremote huanpai getpai cb--------');
                        if(err!==null){
                            cb(err,null);
                        }else{
                            if(paiToChange.s1==paixing.s1&&paiToChange.p1==paixing.p1){
                                var newPai = {
                                    p1:new_p1.toString(),
                                    s1:new_s1.toString(),
                                    p2:paixing.p2,
                                    s2:paixing.s2,
                                    p3:paixing.p3,
                                    s3:paixing.s3
                                };
                                gameDao.updatePai(rid,newPai,location,function(err,res){
                                    if(err!==null){
                                        cb(err,null);
                                    }else{
                                        cb(null,newPai1);
                                    }
                                });

                            }else if(paiToChange.s1==paixing.s2&&paiToChange.p1==paixing.p2){
                                var newPai = {
                                    p1:paixing.p1,
                                    s1:paixing.s1,
                                    p2:new_p1.toString(),
                                    s2:new_s1.toString(),
                                    p3:paixing.p3,
                                    s3:paixing.s3
                                };
                                gameDao.updatePai(rid,newPai,location,function(err,res){
                                    if(err!==null){
                                        cb(err,null);
                                    }else{
                                        cb(null,newPai1);
                                    }
                                });
                            }else if(paiToChange.s1==paixing.s3&&paiToChange.p1==paixing.p3){
                                var newPai = {
                                    p1:paixing.p1,
                                    s1:paixing.s1,
                                    p2:paixing.p2,
                                    s2:paixing.s2,
                                    p3:new_p1.toString(),
                                    s3:new_s1.toString()
                                };
                                gameDao.updatePai(rid,newPai,location,function(err,res){
                                    if(err!==null){
                                        cb(err,null);
                                    }else{
                                        cb(null,newPai1);
                                    }
                                });
                            }else{
                                cb('huanPai failed',null);
                            }
                        }
                    });
                }
            });
        }
    });

    //判断换牌次数
    //console.log('-----------enter gamelogicremote huanpai--------');
    //var restPaiArr = cache.get(rid);//剩余牌的数组
    //var index = Math.floor(Math.random()*restPaiArr.length);
    //var new_p1 = parseInt(restPaiArr[index]%13+2);
    //var new_s1 = parseInt(restPaiArr[index]/13+1);
    //
    ////删除抽取的牌
    //restPaiArr[index]=restPaiArr[restPaiArr.length-1];
    //restPaiArr.pop();
    //cache.del(rid);
    //cache.put(rid,restPaiArr);
    //
    //var newPai1 = {
    //    p1:new_p1,
    //    s1:new_s1
    //};
    //gameDao.getPai(rid,location,function(err,paixing){
    //    console.log('-----------enter gamelogicremote huanpai getpai cb--------');
    //    if(err!==null){
    //        cb(err,null);
    //    }else{
    //        if(paiToChange.s1==paixing.s1&&paiToChange.p1==paixing.p1){
    //            var newPai = {
    //                p1:new_p1.toString(),
    //                s1:new_s1.toString(),
    //                p2:paixing.p2,
    //                s2:paixing.s2,
    //                p3:paixing.p3,
    //                s3:paixing.s3
    //            };
    //            gameDao.updatePai(rid,newPai,location,function(err,res){
    //                if(err!==null){
    //                    cb(err,null);
    //                }else{
    //                    cb(null,newPai1);
    //                }
    //            });
    //
    //        }else if(paiToChange.s1==paixing.s2&&paiToChange.p1==paixing.p2){
    //            var newPai = {
    //                p1:paixing.p1,
    //                s1:paixing.s1,
    //                p2:new_p1.toString(),
    //                s2:new_s1.toString(),
    //                p3:paixing.p3,
    //                s3:paixing.s3
    //            };
    //            gameDao.updatePai(rid,newPai,location,function(err,res){
    //                if(err!==null){
    //                    cb(err,null);
    //                }else{
    //                    cb(null,newPai1);
    //                }
    //            });
    //        }else if(paiToChange.s1==paixing.s3&&paiToChange.p1==paixing.p3){
    //            var newPai = {
    //                p1:paixing.p1,
    //                s1:paixing.s1,
    //                p2:paixing.p2,
    //                s2:paixing.s2,
    //                p3:new_p1.toString(),
    //                s3:new_s1.toString()
    //            };
    //            gameDao.updatePai(rid,newPai,location,function(err,res){
    //                if(err!==null){
    //                    cb(err,null);
    //                }else{
    //                    cb(null,newPai1);
    //                }
    //            });
    //        }else{
    //            cb('huanPai failed',null);
    //        }
    //    }
    //});

};

/**
 * 比牌请求处理路由
 * */
gameLogicRemote.bipai = function(rid,location1,location2,channel,playerId,cb){
    //比牌逻辑，返回结果
    var self = this;
    gameDao.getCurrentChip(rid,function(err,cur_chip){
        gameDao.getOpenMark(rid,location1,function(err,open_mark){
            if(open_mark==1){
                var playerId_int = parseInt(playerId);
                playerDao.subGold(playerId_int,cur_chip*2,function(err,res){
                    console.log('-------bipai subGold------');
                });
                gameDao.getAllChip(rid,function(err,ex_all_chip){
                    gameDao.setAllChip(rid,ex_all_chip+cur_chip*2,function(err,res){
                        gameDao.getPai(rid,location1,function(err,pai1){
                            gameDao.getPai(rid,location2,function(err,pai2){
                                //bipai logic

                                //比较牌1与牌2的大小逻辑
                                var paixing1 = self.sortPai(pai1);
                                var paixing2 = self.sortPai(pai2);

                                console.log("paixing1:"+paixing1);
                                console.log("paixing2:"+paixing2);

                                var paiClass1 = self.classPai(paixing1);
                                var paiClass2 = self.classPai(paixing2);

                                if(paiClass1>paiClass2){
                                    var param={
                                        result:location1
                                    };
                                    gameDao.setIsGameNum(rid,location2,0,function(err){
                                        cb(param.result);
                                    });
                                }else if(paiClass1<paiClass2){
                                    var param={
                                        result:location2
                                    };
                                    gameDao.setIsGameNum(rid,location1,0,function(err){
                                        cb(param.result);
                                    });
                                }else{
                                    //牌型相同情况
                                    if(paiClass1==5){
                                        //都是豹子
                                        if(paixing1[0]>paixing2[0]){
                                            var param={
                                                result:location1
                                            };
                                            gameDao.setIsGameNum(rid,location2,0,function(err){
                                                cb(param.result);
                                            });
                                        }else{
                                            var param={
                                                result:location2
                                            };
                                            gameDao.setIsGameNum(rid,location1,0,function(err){
                                                cb(param.result);
                                            });
                                        }
                                    }else if(paiClass1==4){
                                        //都是金花
                                        if((paixing1[0]-paixing1[1])==1&&(paixing1[1]-paixing1[2])==1){
                                            //金花1是顺子金花
                                            if((paixing1[0]-paixing1[1])==1&&(paixing1[1]-paixing1[2])==1){
                                                //金花1，2都是顺子金花
                                                if(paixing1[0]>paixing2[0]){
                                                    //顺子金花1点数大于顺子金花2
                                                    var param={
                                                        result:location1
                                                    };
                                                    gameDao.setIsGameNum(rid,location2,0,function(err){
                                                        cb(param.result);
                                                    });
                                                }else if(paixing1[0]<paixing2[0]){
                                                    //顺子金花1点数小于顺子金花2
                                                    var param={
                                                        result:location2
                                                    };
                                                    gameDao.setIsGameNum(rid,location1,0,function(err){
                                                        cb(param.result);
                                                    });
                                                }else{
                                                    //顺子金花1点数等于顺子金花2
                                                    if(paixing1[3]>paixing2[3]){
                                                        var param={
                                                            result:location1
                                                        };
                                                        gameDao.setIsGameNum(rid,location2,0,function(err){
                                                            cb(param.result);
                                                        });
                                                    }else{
                                                        var param={
                                                            result:location2
                                                        };
                                                        gameDao.setIsGameNum(rid,location1,0,function(err){
                                                            cb(param.result);
                                                        });
                                                    }
                                                }

                                            }else{
                                                //金花1是顺子金花，金花2不是顺子
                                                var param={
                                                    result:location1
                                                };
                                                gameDao.setIsGameNum(rid,location2,0,function(err){
                                                    cb(param.result);
                                                });
                                            }
                                        }else{
                                            //金花1不是顺子金花
                                            if((paixing1[0]-paixing1[1])==1&&(paixing1[1]-paixing1[2])==1){
                                                //金花1不是顺子金花，金花2是顺子金花
                                                var param={
                                                    result:location2
                                                };
                                                gameDao.setIsGameNum(rid,location2,0,function(err){
                                                    cb(param.result);
                                                });
                                            }else{
                                                //金花1，2都不是顺子金花
                                                if(paixing1[0]>paixing2[0]){
                                                    //金花1点数大于顺子金花2
                                                    var param={
                                                        result:location1
                                                    };
                                                    gameDao.setIsGameNum(rid,location2,0,function(err){
                                                        cb(param.result);
                                                    });
                                                }else if(paixing1[0]<paixing2[0]){
                                                    //金花1点数小于顺子金花2
                                                    var param={
                                                        result:location2
                                                    };
                                                    gameDao.setIsGameNum(rid,location1,0,function(err){
                                                        cb(param.result);
                                                    });
                                                }else{
                                                    //金花1点数等于顺子金花2
                                                    if(paixing1[1]>paixing2[1]){
                                                        var param={
                                                            result:location1
                                                        };
                                                        gameDao.setIsGameNum(rid,location2,0,function(err){
                                                            cb(param.result);
                                                        });
                                                    }else if(paixing1[1]<paixing2[1]){
                                                        var param={
                                                            result:location2
                                                        };
                                                        gameDao.setIsGameNum(rid,location1,0,function(err){
                                                            cb(param.result);
                                                        });
                                                    }else{
                                                        if(paixing1[2]>paixing2[2]){
                                                            var param={
                                                                result:location1
                                                            };
                                                            gameDao.setIsGameNum(rid,location2,0,function(err){
                                                                cb(param.result);
                                                            });
                                                        }else if(paixing1[2]<paixing2[2]){
                                                            var param={
                                                                result:location2
                                                            };
                                                            gameDao.setIsGameNum(rid,location1,0,function(err){
                                                                cb(param.result);
                                                            });
                                                        }else if(paixing1[3]>paixing2[3]){
                                                            var param={
                                                                result:location1
                                                            };
                                                            gameDao.setIsGameNum(rid,location2,0,function(err){
                                                                cb(param.result);
                                                            });
                                                        }else{
                                                            var param={
                                                                result:location2
                                                            };
                                                            gameDao.setIsGameNum(rid,location1,0,function(err){
                                                                cb(param.result);
                                                            });
                                                        }
                                                    }
                                                }
                                            }

                                        }

                                    }else if(paiClass1==3){
                                        //都是顺子
                                        if(paixing1[0]>paixing2[0]){
                                            var param={
                                                result:location1
                                            };
                                            gameDao.setIsGameNum(rid,location2,0,function(err){
                                                cb(param.result);
                                            });
                                        }else if(paixing1[0]<paixing2[0]){
                                            var param={
                                                result:location2
                                            };
                                            gameDao.setIsGameNum(rid,location1,0,function(err){
                                                cb(param.result);
                                            });
                                        }else{
                                            //两个顺子点数一样,比花色
                                            if(paixing1[3]>paixing2[3]){
                                                var param={
                                                    result:location1
                                                };
                                                gameDao.setIsGameNum(rid,location2,0,function(err){
                                                    cb(param.result);
                                                });
                                            }else{
                                                var param={
                                                    result:location2
                                                };
                                                gameDao.setIsGameNum(rid,location1,0,function(err){
                                                    cb(param.result);
                                                });
                                            }
                                        }
                                    }else if(paiClass1==2){
                                        //都是对子
                                        if(paixing1[1]>paixing2[1]){
                                            var param={
                                                result:location1
                                            };
                                            gameDao.setIsGameNum(rid,location2,0,function(err){
                                                cb(param.result);
                                            });
                                        }else if(paixing1[1]<paixing2[1]){
                                            var param={
                                                result:location2
                                            };
                                            gameDao.setIsGameNum(rid,location1,0,function(err){
                                                cb(param.result);
                                            });
                                        }else{
                                            var param={
                                                result:location1
                                            };
                                            gameDao.setIsGameNum(rid,location2,0,function(err){
                                                cb(param.result);
                                            });
                                        }
                                    }else {
                                        //都是单牌
                                        if(paixing1[0]>paixing2[0]){
                                            var param={
                                                result:location1
                                            };
                                            gameDao.setIsGameNum(rid,location2,0,function(err){
                                                cb(param.result);
                                            });
                                        }else if(paixing1[0]<paixing2[0]){
                                            var param={
                                                result:location2
                                            };
                                            gameDao.setIsGameNum(rid,location1,0,function(err){
                                                cb(param.result);
                                            });
                                        }else {
                                            if(paixing1[1]>paixing2[1]){
                                                var param={
                                                    result:location1
                                                };
                                                gameDao.setIsGameNum(rid,location2,0,function(err){
                                                    cb(param.result);
                                                });
                                            }else if(paixing1[1]<paixing2[1]){
                                                var param={
                                                    result:location2
                                                };
                                                gameDao.setIsGameNum(rid,location1,0,function(err){
                                                    cb(param.result);
                                                });
                                            }else{
                                                if(paixing1[2]>paixing2[2]){
                                                    var param={
                                                        result:location1
                                                    };
                                                    gameDao.setIsGameNum(rid,location2,0,function(err){
                                                        cb(param.result);
                                                    });
                                                }else {
                                                    var param={
                                                        result:location2
                                                    };
                                                    gameDao.setIsGameNum(rid,location1,0,function(err){
                                                        cb(param.result);
                                                    });
                                                }
                                            }
                                        }

                                    }
                                }

                                gameDao.nextCurPlayer(rid,function(err,new_loc){
                                    //出牌定时，重置定时器
                                    delayDao.removeDelay(rid,function(){
                                        console.log("bipai:removeDelay success");
                                        setTimeout(function(){
                                            gameLogicRemote.changeCurPlayer(rid,new_loc,channel);
                                            delayDao.addDelay(rid,10,function(){
                                                console.log("bipai:addDelay success");
                                            });
                                        },4800);
                                    });
                                    console.log("nextCurPlayer success");
                                });
                            });
                        });
                    });
                });
            }else{
                var playerId_int = parseInt(playerId);
                playerDao.subGold(playerId_int,cur_chip,function(err,res){
                    console.log('-------bipai subGold------');
                });
                gameDao.getAllChip(rid,function(err,ex_all_chip){
                    gameDao.setAllChip(rid,ex_all_chip+cur_chip,function(err,res){
                        gameDao.getPai(rid,location1,function(err,pai1){
                            gameDao.getPai(rid,location2,function(err,pai2){
                                //bipai logic

                                //比较牌1与牌2的大小逻辑
                                var paixing1 = self.sortPai(pai1);
                                var paixing2 = self.sortPai(pai2);

                                console.log("paixing1:"+paixing1);
                                console.log("paixing2:"+paixing2);

                                var paiClass1 = self.classPai(paixing1);
                                var paiClass2 = self.classPai(paixing2);

                                if(paiClass1>paiClass2){
                                    var param={
                                        result:location1
                                    };
                                    gameDao.setIsGameNum(rid,location2,0,function(err){
                                        cb(param.result);
                                    });
                                }else if(paiClass1<paiClass2){
                                    var param={
                                        result:location2
                                    };
                                    gameDao.setIsGameNum(rid,location1,0,function(err){
                                        cb(param.result);
                                    });
                                }else{
                                    //牌型相同情况
                                    if(paiClass1==5){
                                        //都是豹子
                                        if(paixing1[0]>paixing2[0]){
                                            var param={
                                                result:location1
                                            };
                                            gameDao.setIsGameNum(rid,location2,0,function(err){
                                                cb(param.result);
                                            });
                                        }else{
                                            var param={
                                                result:location2
                                            };
                                            gameDao.setIsGameNum(rid,location1,0,function(err){
                                                cb(param.result);
                                            });
                                        }
                                    }else if(paiClass1==4){
                                        //都是金花
                                        if((paixing1[0]-paixing1[1])==1&&(paixing1[1]-paixing1[2])==1){
                                            //金花1是顺子金花
                                            if((paixing1[0]-paixing1[1])==1&&(paixing1[1]-paixing1[2])==1){
                                                //金花1，2都是顺子金花
                                                if(paixing1[0]>paixing2[0]){
                                                    //顺子金花1点数大于顺子金花2
                                                    var param={
                                                        result:location1
                                                    };
                                                    gameDao.setIsGameNum(rid,location2,0,function(err){
                                                        cb(param.result);
                                                    });
                                                }else if(paixing1[0]<paixing2[0]){
                                                    //顺子金花1点数小于顺子金花2
                                                    var param={
                                                        result:location2
                                                    };
                                                    gameDao.setIsGameNum(rid,location1,0,function(err){
                                                        cb(param.result);
                                                    });
                                                }else{
                                                    //顺子金花1点数等于顺子金花2
                                                    if(paixing1[3]>paixing2[3]){
                                                        var param={
                                                            result:location1
                                                        };
                                                        gameDao.setIsGameNum(rid,location2,0,function(err){
                                                            cb(param.result);
                                                        });
                                                    }else{
                                                        var param={
                                                            result:location2
                                                        };
                                                        gameDao.setIsGameNum(rid,location1,0,function(err){
                                                            cb(param.result);
                                                        });
                                                    }
                                                }

                                            }else{
                                                //金花1是顺子金花，金花2不是顺子
                                                var param={
                                                    result:location1
                                                };
                                                gameDao.setIsGameNum(rid,location2,0,function(err){
                                                    cb(param.result);
                                                });
                                            }
                                        }else{
                                            //金花1不是顺子金花
                                            if((paixing1[0]-paixing1[1])==1&&(paixing1[1]-paixing1[2])==1){
                                                //金花1不是顺子金花，金花2是顺子金花
                                                var param={
                                                    result:location2
                                                };
                                                gameDao.setIsGameNum(rid,location2,0,function(err){
                                                    cb(param.result);
                                                });
                                            }else{
                                                //金花1，2都不是顺子金花
                                                if(paixing1[0]>paixing2[0]){
                                                    //金花1点数大于顺子金花2
                                                    var param={
                                                        result:location1
                                                    };
                                                    gameDao.setIsGameNum(rid,location2,0,function(err){
                                                        cb(param.result);
                                                    });
                                                }else if(paixing1[0]<paixing2[0]){
                                                    //金花1点数小于顺子金花2
                                                    var param={
                                                        result:location2
                                                    };
                                                    gameDao.setIsGameNum(rid,location1,0,function(err){
                                                        cb(param.result);
                                                    });
                                                }else{
                                                    //金花1点数等于顺子金花2
                                                    if(paixing1[1]>paixing2[1]){
                                                        var param={
                                                            result:location1
                                                        };
                                                        gameDao.setIsGameNum(rid,location2,0,function(err){
                                                            cb(param.result);
                                                        });
                                                    }else if(paixing1[1]<paixing2[1]){
                                                        var param={
                                                            result:location2
                                                        };
                                                        gameDao.setIsGameNum(rid,location1,0,function(err){
                                                            cb(param.result);
                                                        });
                                                    }else{
                                                        if(paixing1[2]>paixing2[2]){
                                                            var param={
                                                                result:location1
                                                            };
                                                            gameDao.setIsGameNum(rid,location2,0,function(err){
                                                                cb(param.result);
                                                            });
                                                        }else if(paixing1[2]<paixing2[2]){
                                                            var param={
                                                                result:location2
                                                            };
                                                            gameDao.setIsGameNum(rid,location1,0,function(err){
                                                                cb(param.result);
                                                            });
                                                        }else if(paixing1[3]>paixing2[3]){
                                                            var param={
                                                                result:location1
                                                            };
                                                            gameDao.setIsGameNum(rid,location2,0,function(err){
                                                                cb(param.result);
                                                            });
                                                        }else{
                                                            var param={
                                                                result:location2
                                                            };
                                                            gameDao.setIsGameNum(rid,location1,0,function(err){
                                                                cb(param.result);
                                                            });
                                                        }
                                                    }
                                                }
                                            }

                                        }

                                    }else if(paiClass1==3){
                                        //都是顺子
                                        if(paixing1[0]>paixing2[0]){
                                            var param={
                                                result:location1
                                            };
                                            gameDao.setIsGameNum(rid,location2,0,function(err){
                                                cb(param.result);
                                            });
                                        }else if(paixing1[0]<paixing2[0]){
                                            var param={
                                                result:location2
                                            };
                                            gameDao.setIsGameNum(rid,location1,0,function(err){
                                                cb(param.result);
                                            });
                                        }else{
                                            //两个顺子点数一样,比花色
                                            if(paixing1[3]>paixing2[3]){
                                                var param={
                                                    result:location1
                                                };
                                                gameDao.setIsGameNum(rid,location2,0,function(err){
                                                    cb(param.result);
                                                });
                                            }else{
                                                var param={
                                                    result:location2
                                                };
                                                gameDao.setIsGameNum(rid,location1,0,function(err){
                                                    cb(param.result);
                                                });
                                            }
                                        }
                                    }else if(paiClass1==2){
                                        //都是对子
                                        if(paixing1[1]>paixing2[1]){
                                            var param={
                                                result:location1
                                            };
                                            gameDao.setIsGameNum(rid,location2,0,function(err){
                                                cb(param.result);
                                            });
                                        }else if(paixing1[1]<paixing2[1]){
                                            var param={
                                                result:location2
                                            };
                                            gameDao.setIsGameNum(rid,location1,0,function(err){
                                                cb(param.result);
                                            });
                                        }else{
                                            var param={
                                                result:location1
                                            };
                                            gameDao.setIsGameNum(rid,location2,0,function(err){
                                                cb(param.result);
                                            });
                                        }
                                    }else {
                                        //都是单牌
                                        if(paixing1[0]>paixing2[0]){
                                            var param={
                                                result:location1
                                            };
                                            gameDao.setIsGameNum(rid,location2,0,function(err){
                                                cb(param.result);
                                            });
                                        }else if(paixing1[0]<paixing2[0]){
                                            var param={
                                                result:location2
                                            };
                                            gameDao.setIsGameNum(rid,location1,0,function(err){
                                                cb(param.result);
                                            });
                                        }else {
                                            if(paixing1[1]>paixing2[1]){
                                                var param={
                                                    result:location1
                                                };
                                                gameDao.setIsGameNum(rid,location2,0,function(err){
                                                    cb(param.result);
                                                });
                                            }else if(paixing1[1]<paixing2[1]){
                                                var param={
                                                    result:location2
                                                };
                                                gameDao.setIsGameNum(rid,location1,0,function(err){
                                                    cb(param.result);
                                                });
                                            }else{
                                                if(paixing1[2]>paixing2[2]){
                                                    var param={
                                                        result:location1
                                                    };
                                                    gameDao.setIsGameNum(rid,location2,0,function(err){
                                                        cb(param.result);
                                                    });
                                                }else {
                                                    var param={
                                                        result:location2
                                                    };
                                                    gameDao.setIsGameNum(rid,location1,0,function(err){
                                                        cb(param.result);
                                                    });
                                                }
                                            }
                                        }

                                    }
                                }

                                gameDao.nextCurPlayer(rid,function(err,new_loc){
                                    //出牌定时，重置定时器
                                    delayDao.removeDelay(rid,function(){
                                        console.log("bipai:removeDelay success");
                                        setTimeout(function(){
                                            gameLogicRemote.changeCurPlayer(rid,new_loc,channel);
                                            delayDao.addDelay(rid,10,function(){
                                                console.log("bipai:addDelay success");
                                            });
                                        },4800);
                                    });
                                    console.log("nextCurPlayer success");
                                });
                            });
                        });
                    });
                });
            }
        });

    });

    //gameDao.getPai(rid,location1,function(err,pai1){
    //    gameDao.getPai(rid,location2,function(err,pai2){
    //        //bipai logic
    //
    //        //比较牌1与牌2的大小逻辑
    //        var paixing1 = self.sortPai(pai1);
    //        var paixing2 = self.sortPai(pai2);
    //
    //        console.log("paixing1:"+paixing1);
    //        console.log("paixing2:"+paixing2);
    //
    //        var paiClass1 = self.classPai(paixing1);
    //        var paiClass2 = self.classPai(paixing2);
    //
    //        if(paiClass1>paiClass2){
    //            var param={
    //                result:location1
    //            };
    //            gameDao.setIsGameNum(rid,location2,0,function(err){
    //                cb(param.result);
    //            });
    //        }else if(paiClass1<paiClass2){
    //            var param={
    //                result:location2
    //            };
    //            gameDao.setIsGameNum(rid,location1,0,function(err){
    //                cb(param.result);
    //            });
    //        }else{
    //            //牌型相同情况
    //            if(paiClass1==5){
    //                //都是豹子
    //                if(paixing1[0]>paixing2[0]){
    //                    var param={
    //                        result:location1
    //                    };
    //                    gameDao.setIsGameNum(rid,location2,0,function(err){
    //                        cb(param.result);
    //                    });
    //                }else{
    //                    var param={
    //                        result:location2
    //                    };
    //                    gameDao.setIsGameNum(rid,location1,0,function(err){
    //                        cb(param.result);
    //                    });
    //                }
    //            }else if(paiClass1==4){
    //                //都是金花
    //                if((paixing1[0]-paixing1[1])==1&&(paixing1[1]-paixing1[2])==1){
    //                    //金花1是顺子金花
    //                    if((paixing1[0]-paixing1[1])==1&&(paixing1[1]-paixing1[2])==1){
    //                        //金花1，2都是顺子金花
    //                        if(paixing1[0]>paixing2[0]){
    //                            //顺子金花1点数大于顺子金花2
    //                            var param={
    //                                result:location1
    //                            };
    //                            gameDao.setIsGameNum(rid,location2,0,function(err){
    //                                cb(param.result);
    //                            });
    //                        }else if(paixing1[0]<paixing2[0]){
    //                            //顺子金花1点数小于顺子金花2
    //                            var param={
    //                                result:location2
    //                            };
    //                            gameDao.setIsGameNum(rid,location1,0,function(err){
    //                                cb(param.result);
    //                            });
    //                        }else{
    //                            //顺子金花1点数等于顺子金花2
    //                            if(paixing1[3]>paixing2[3]){
    //                                var param={
    //                                    result:location1
    //                                };
    //                                gameDao.setIsGameNum(rid,location2,0,function(err){
    //                                    cb(param.result);
    //                                });
    //                            }else{
    //                                var param={
    //                                    result:location2
    //                                };
    //                                gameDao.setIsGameNum(rid,location1,0,function(err){
    //                                    cb(param.result);
    //                                });
    //                            }
    //                        }
    //
    //                    }else{
    //                        //金花1是顺子金花，金花2不是顺子
    //                        var param={
    //                            result:location1
    //                        };
    //                        gameDao.setIsGameNum(rid,location2,0,function(err){
    //                            cb(param.result);
    //                        });
    //                    }
    //                }else{
    //                    //金花1不是顺子金花
    //                    if((paixing1[0]-paixing1[1])==1&&(paixing1[1]-paixing1[2])==1){
    //                        //金花1不是顺子金花，金花2是顺子金花
    //                        var param={
    //                            result:location2
    //                        };
    //                        gameDao.setIsGameNum(rid,location2,0,function(err){
    //                            cb(param.result);
    //                        });
    //                    }else{
    //                        //金花1，2都不是顺子金花
    //                        if(paixing1[0]>paixing2[0]){
    //                            //金花1点数大于顺子金花2
    //                            var param={
    //                                result:location1
    //                            };
    //                            gameDao.setIsGameNum(rid,location2,0,function(err){
    //                                cb(param.result);
    //                            });
    //                        }else if(paixing1[0]<paixing2[0]){
    //                            //金花1点数小于顺子金花2
    //                            var param={
    //                                result:location2
    //                            };
    //                            gameDao.setIsGameNum(rid,location1,0,function(err){
    //                                cb(param.result);
    //                            });
    //                        }else{
    //                            //金花1点数等于顺子金花2
    //                            if(paixing1[1]>paixing2[1]){
    //                                var param={
    //                                    result:location1
    //                                };
    //                                gameDao.setIsGameNum(rid,location2,0,function(err){
    //                                    cb(param.result);
    //                                });
    //                            }else if(paixing1[1]<paixing2[1]){
    //                                var param={
    //                                    result:location2
    //                                };
    //                                gameDao.setIsGameNum(rid,location1,0,function(err){
    //                                    cb(param.result);
    //                                });
    //                            }else{
    //                                if(paixing1[2]>paixing2[2]){
    //                                    var param={
    //                                        result:location1
    //                                    };
    //                                    gameDao.setIsGameNum(rid,location2,0,function(err){
    //                                        cb(param.result);
    //                                    });
    //                                }else if(paixing1[2]<paixing2[2]){
    //                                    var param={
    //                                        result:location2
    //                                    };
    //                                    gameDao.setIsGameNum(rid,location1,0,function(err){
    //                                        cb(param.result);
    //                                    });
    //                                }else if(paixing1[3]>paixing2[3]){
    //                                    var param={
    //                                        result:location1
    //                                    };
    //                                    gameDao.setIsGameNum(rid,location2,0,function(err){
    //                                        cb(param.result);
    //                                    });
    //                                }else{
    //                                    var param={
    //                                        result:location2
    //                                    };
    //                                    gameDao.setIsGameNum(rid,location1,0,function(err){
    //                                        cb(param.result);
    //                                    });
    //                                }
    //                            }
    //                        }
    //                    }
    //
    //                }
    //
    //            }else if(paiClass1==3){
    //                //都是顺子
    //                if(paixing1[0]>paixing2[0]){
    //                    var param={
    //                        result:location1
    //                    };
    //                    gameDao.setIsGameNum(rid,location2,0,function(err){
    //                        cb(param.result);
    //                    });
    //                }else if(paixing1[0]<paixing2[0]){
    //                    var param={
    //                        result:location2
    //                    };
    //                    gameDao.setIsGameNum(rid,location1,0,function(err){
    //                        cb(param.result);
    //                    });
    //                }else{
    //                    //两个顺子点数一样,比花色
    //                    if(paixing1[3]>paixing2[3]){
    //                        var param={
    //                            result:location1
    //                        };
    //                        gameDao.setIsGameNum(rid,location2,0,function(err){
    //                            cb(param.result);
    //                        });
    //                    }else{
    //                        var param={
    //                            result:location2
    //                        };
    //                        gameDao.setIsGameNum(rid,location1,0,function(err){
    //                            cb(param.result);
    //                        });
    //                    }
    //                }
    //            }else if(paiClass1==2){
    //                //都是对子
    //                if(paixing1[1]>paixing2[1]){
    //                    var param={
    //                        result:location1
    //                    };
    //                    gameDao.setIsGameNum(rid,location2,0,function(err){
    //                        cb(param.result);
    //                    });
    //                }else if(paixing1[1]<paixing2[1]){
    //                    var param={
    //                        result:location2
    //                    };
    //                    gameDao.setIsGameNum(rid,location1,0,function(err){
    //                        cb(param.result);
    //                    });
    //                }else{
    //                    var param={
    //                        result:location1
    //                    };
    //                    gameDao.setIsGameNum(rid,location2,0,function(err){
    //                        cb(param.result);
    //                    });
    //                }
    //            }else {
    //                //都是单牌
    //                if(paixing1[0]>paixing2[0]){
    //                    var param={
    //                        result:location1
    //                    };
    //                    gameDao.setIsGameNum(rid,location2,0,function(err){
    //                        cb(param.result);
    //                    });
    //                }else if(paixing1[0]<paixing2[0]){
    //                    var param={
    //                        result:location2
    //                    };
    //                    gameDao.setIsGameNum(rid,location1,0,function(err){
    //                        cb(param.result);
    //                    });
    //                }else {
    //                    if(paixing1[1]>paixing2[1]){
    //                        var param={
    //                            result:location1
    //                        };
    //                        gameDao.setIsGameNum(rid,location2,0,function(err){
    //                            cb(param.result);
    //                        });
    //                    }else if(paixing1[1]<paixing2[1]){
    //                        var param={
    //                            result:location2
    //                        };
    //                        gameDao.setIsGameNum(rid,location1,0,function(err){
    //                            cb(param.result);
    //                        });
    //                    }else{
    //                        if(paixing1[2]>paixing2[2]){
    //                            var param={
    //                                result:location1
    //                            };
    //                            gameDao.setIsGameNum(rid,location2,0,function(err){
    //                                cb(param.result);
    //                            });
    //                        }else {
    //                            var param={
    //                                result:location2
    //                            };
    //                            gameDao.setIsGameNum(rid,location1,0,function(err){
    //                                cb(param.result);
    //                            });
    //                        }
    //                    }
    //                }
    //
    //            }
    //        }
    //
    //        gameDao.nextCurPlayer(rid,function(err,new_loc){
    //            //出牌定时，重置定时器
    //            delayDao.removeDelay(rid,function(){
    //                console.log("bipai:removeDelay success");
    //                setTimeout(function(){
    //                    gameLogicRemote.changeCurPlayer(rid,new_loc,channel);
    //                    delayDao.addDelay(rid,10,function(){
    //                        console.log("bipai:addDelay success");
    //                    });
    //                },4800);
    //            });
    //            console.log("nextCurPlayer success");
    //        });
    //    });
    //});
};

/**
 * 输入牌json进行预处理排序（点数以及花色按从大到小排序）
 * */
gameLogicRemote.sortPai = function(paixing1){
    //paixing eg:{p1:"2",p2:"3",p3:"4",s1:"1",s2:"2",s3:"3"}
    var pai1_num1 = parseInt(paixing1.p1);
    var pai1_num2 = parseInt(paixing1.p2);
    var pai1_num3 = parseInt(paixing1.p3);
    var pai1_num4 = parseInt(paixing1.s1);
    var pai1_num5 = parseInt(paixing1.s2);
    var pai1_num6 = parseInt(paixing1.s3);

    console.log("before paixu:" +pai1_num1+" "+pai1_num2+" "+pai1_num3);

    //big -> small
    var sortABC = function(pai_num1,pai_num2,pai_num3){
        if(pai_num1<pai_num2){
            var temp = pai_num1;
            pai_num1 = pai_num2;
            pai_num2 = temp;
        }
        if(pai_num2<pai_num3){
            var temp = pai_num2;
            pai_num2 = pai_num3;
            pai_num3 = temp;
        }
        if(pai_num1<pai_num2){
            var temp = pai_num1;
            pai_num1 = pai_num2;
            pai_num2 = temp;
        }
        return [pai_num1,pai_num2,pai_num3];
    };

    var tempA = sortABC(pai1_num1,pai1_num2,pai1_num3);
    var tempB = sortABC(pai1_num4,pai1_num5,pai1_num6);

    tempA = tempA.concat(tempB);

    return tempA;
};


/**
 * 判断牌型（5豹子 4金花 3顺子 2对子 1单牌）
 * 输入参数为经过排序函数sortPai处理以后的牌型数组
 * */
gameLogicRemote.classPai = function(paiArray){
    var kind = 1;
    if(paiArray[0]==paiArray[1]&&paiArray[1]==paiArray[2]){
        kind = 5;
    }else if(paiArray[3]==paiArray[4]&&paiArray[4]==paiArray[5]){
        kind = 4;
    }else if((paiArray[0]-paiArray[1])==1&&(paiArray[1]-paiArray[2])==1){
        kind = 3;
    }else if(paiArray[0]==paiArray[1]||paiArray[1]==paiArray[2]){
        kind = 2;
    }else {
        //console.log("hehehehehehehe");
        kind = 1;
    }
    return kind;
};

/**
 * 跟牌
 * */
gameLogicRemote.follow = function(rid,location,channel,username){
    gameDao.getOpenMark(rid,location,function(err,mark){
        gameDao.getCurrentChip(rid,function(err,cur_chip){
            gameDao.getAllChip(rid,function(err,ex_allchip){
                var cur_allchip = ex_allchip+cur_chip;
                if(mark==1){
                    cur_allchip = cur_allchip + cur_chip;
                    var playerId_int = parseInt(username);
                    playerDao.subGold(playerId_int,cur_chip*2,function(err,res){
                        console.log('-------fapai subGold------');
                    });
                }else{
                    var playerId_int = parseInt(username);
                    playerDao.subGold(playerId_int,cur_chip,function(err,res){
                        console.log('-------fapai subGold------');
                    });
                }

                gameDao.setAllChip(rid,cur_allchip,function(err,all_chip){
                    var param = {
                        route:'onFollow',
                        user:username,
                        all_chip:cur_allchip
                    };
                    channel.pushMessage(param);
                });
            });
        });
    });
    gameDao.nextCurPlayer(rid,function(err,new_loc){
        console.log("nextCurPlayer success");
        gameLogicRemote.changeCurPlayer(rid,new_loc,channel);
        //出牌定时，重置定时器
        delayDao.removeDelay(rid,function(){
            console.log("follow:removeDelay success");
            delayDao.addDelay(rid,10,function(){
                console.log("follow:addDelay success");
            });
        });
    });
    //var playerId_int = parseInt(playerId);
    //playerDao.addGold(playerId,-100,0,function(err,res){
    //    console.log('fapai addGold-------');
    //});

};

/**
 * add chip
 * */
gameLogicRemote.add = function(rid,add_chip,location,channel,username){
    gameDao.getCurrentChip(rid,function(err,ex_cur_chip){
        if(ex_cur_chip<add_chip){
            //减玩家金币，根据回调，成功以后才能进行下面的

            gameDao.setCurrentChip(rid,add_chip,function(err,new_chip){
                gameDao.getOpenMark(rid,location,function(err,mark){
                    var chip = add_chip;
                    if(mark==1){
                        chip = chip*2;
                    }
                    var playerId_int = parseInt(username);
                    playerDao.subGold(playerId_int,chip,0,function(err,res){
                        console.log('-------add chip addGold-------');
                    });
                    gameDao.getAllChip(rid,function(err,ex_allchip){
                        var cur_allchip = ex_allchip+chip;
                        gameDao.setAllChip(rid,cur_allchip,function(err,all_chip){
                            var param = {
                                route:'onAddChip',
                                user:username,
                                current_chip:new_chip,
                                all_chip:cur_allchip
                            };
                            channel.pushMessage(param);
                        });
                    });

                });

            });
            gameDao.nextCurPlayer(rid,function(err,new_loc){
                console.log("nextCurPlayer success");
                gameLogicRemote.changeCurPlayer(rid,new_loc,channel);
                //出牌定时，重置定时器
                delayDao.removeDelay(rid,function(){
                    console.log("add_chip:removeDelay success");
                    delayDao.addDelay(rid,10,function(){
                        console.log("add_chip:addDelay success");
                    });
                });
            });
        }
    });

};

/**
 * open(kan pai)
 * */
gameLogicRemote.open = function(rid,location,channel,username){
    gameDao.setOpenMark(rid,location,function(err){
        var param = {
            route:'onOpen',
            user:username
        };
        channel.pushMessage(param);
        delayDao.removeDelay(rid,function(){
            delayDao.addDelay(rid,10,function(){
                console.log("gameLogicRemote:open addDelay success");
            });
        });
    });
};

/**
 * throw
 * param:rid,msg.location,channel,username,channelService
 * */
gameLogicRemote.throw = function(app,uid,rid,location,channel,username,channelService){
    gameDao.setIsGameNum(rid,location,0,function(err){
        var param = {
            route:'onThrow',
            user:username
        };
        channel.pushMessage(param);
        gameDao.cleanOpenMark(rid,location,function(err){});

        gameDao.getCurPlayer(rid,function(err,cur_player){
            if(cur_player==location){
                //更改当前出牌玩家
                gameDao.nextCurPlayer(rid,function(err,new_loc){
                    console.log("nextCurPlayer success");
                    gameLogicRemote.changeCurPlayer(rid,new_loc,channel);
                    //出牌定时，重置定时器
                    delayDao.removeDelay(rid,function(){
                        console.log("throw:removeDelay success");
                        delayDao.addDelay(rid,10,function(){
                            console.log("throw:addDelay success");
                            gameDao.getIsGameNum(rid,function(err,isGameNumArr){
                                var sum = 0;
                                var game_winner;
                                for(var i=1;i<6;i++){
                                    if(isGameNumArr[i]==1){
                                        sum = sum +isGameNumArr[i];
                                        game_winner=i;
                                    }
                                }
                                if(sum<=1){
                                    //重新开始

                                    gameLogicRemote.restartGame(app,uid,rid,channel,channelService,game_winner,username);

                                }
                            });
                        });
                    });

                });
            } else {
                gameDao.getIsGameNum(rid,function(err,isGameNumArr){
                    var sum = 0;
                    var game_winner;
                    for(var i=1;i<6;i++){
                        if(isGameNumArr[i]==1){
                            sum = sum +isGameNumArr[i];
                            game_winner=i;
                        }
                    }
                    if(sum<=1){
                        //重新开始
                        gameLogicRemote.restartGame(app,uid,rid,channel,channelService,game_winner,username);

                    }
                });
            }
        });

    });
};

/**
 * 获取全押应该下注的筹码
 * @param rid
 * @param cb 回调函数，返回的是allin的筹码数量
 */
gameLogicRemote.getAllin_chip = function(rid,cb){
    var allin_chip = 9999999;
    gameDao.getIsGameNum(rid,function(err,isGameArr){
        var mark = 0;
        for(var i= 1;i<6;i++){
            if(isGameArr[i]==1){
                gameDao.getLocalPlayer(rid,i,function(err,uid,loc){
                    var playerId = uid.split('*')[0];
                    playerDao.getPlayerByPlayerId(playerId,function(err,playerInfo){
                        mark++;
                        if(playerInfo.gold<allin_chip){
                            allin_chip = playerInfo.gold;
                        }
                        console.error('mark:'+mark);
                        if(mark==2){
                            console.error('callback');
                            cb(allin_chip);
                        }
                    });
                });
            }else{
                //mark--;
            }
        }
    });
};

/**
 * 全押执行方法
 * @param rid 房间号
 * @param location 玩家位置
 * @param channel
 */
gameLogicRemote.allin = function(rid,location,channel,playerId){
    gameDao.getIsGameNum(rid,function(err,isGameArr){
        var temp = 0;
        for(var i=0;i<5;i++){
            temp = temp+isGameArr[i+1];
            console.log("temp"+temp);
        }
        //房间只有两个人的时候才能进行all in操作
        if(temp==2){
            //console.error("temp==2");
            gameDao.getAllinMark(rid,function(err,allin_mark){
                if(allin_mark==0){
                    gameDao.setAllinMark(rid,1,function(err){
                        gameLogicRemote.getAllin_chip(rid,function(allin_chip){
                            //减玩家金币，根据回调，成功以后才能进行下面的
                            var playerId_int = parseInt(playerId);
                            playerDao.subGold(playerId_int,allin_chip,function(err,res){
                                console.log('allin fapai addGold-------');
                                gameDao.setCurrentChip(rid,allin_chip,function(err,new_chip){
                                    gameDao.getAllChip(rid,function(err,ex_allchip){
                                        var cur_allchip = ex_allchip+allin_chip;
                                        gameDao.setAllChip(rid,cur_allchip,function(err,all_chip){
                                            var param = {
                                                route:'onAllin',
                                                location:location,
                                                current_chip:new_chip,
                                                all_chip:cur_allchip,
                                                allin_player:'1'
                                            };
                                            channel.pushMessage(param);
                                        });
                                    });

                                });
                                gameDao.nextCurPlayer(rid,function(err,new_loc){
                                    console.log("nextCurPlayer success");
                                    gameLogicRemote.changeCurPlayer(rid,new_loc,channel);
                                    //出牌定时，重置定时器
                                    delayDao.removeDelay(rid,function(){
                                        console.log("add_chip:removeDelay success");
                                        delayDao.addDelay(rid,10,function(){
                                            console.log("add_chip:addDelay success");
                                        });
                                    });
                                });
                            });

                        });
                    });
                    console.log("line 906");

                }else if(allin_mark==1){
                    gameDao.getCurrentChip(rid,function(err,cur_chip){
                        gameDao.getAllChip(rid,function(err,ex_allchip){
                            var cur_allchip = ex_allchip+cur_chip;
                            gameDao.setAllChip(rid,cur_allchip,function(err,all_chip){
                                var param = {
                                    route:'onAllin',
                                    location:location,
                                    current_chip:cur_chip,
                                    all_chip:cur_allchip,
                                    allin_player:'2'
                                };
                                channel.pushMessage(param);
                            });
                        });
                    });

                }
            });
        }
    });
};

/**
 * 广播玩家轮换信息
 * */
gameLogicRemote.changeCurPlayer = function(rid,location,channel){
    var param = {
        route:'onChangePlayer',
        location:location
    };
    channel.pushMessage(param);
};

/**
 * 比牌或者最后一位玩家弃牌以后，重新开始牌局游戏
 * @param app
 * @param uid
 * @param rid
 * @param channel
 * @param channelService
 * @param game_winner 上一局胜利玩家
 */
gameLogicRemote.restartGame = function(app,uid,rid,channel,channelService,game_winner,playerId){
    //重新开始
    var param = {
        route:'onEnd',
        winner:game_winner
    };
    channel.pushMessage(param);
    //游戏结束，取消定时器
    delayDao.removeDelay(rid,function(){
        console.log("throw:removeDelay success");
    });
    gameDao.getRoomStatus(rid,function(err,roomStatus){
        //if(err)
        if(roomStatus==1){
            gameDao.getRoomInfo(rid,function(err,roomInfo){
                var playerId;
                var pai_type;
                var paixing = [];
                switch (game_winner){
                    case 1:
                        //console.log("roomInfo.pai:"+roomInfo.pai1);
                        paixing = gameLogicRemote.sortPai(JSON.parse(roomInfo.pai1));
                        //console.error("paixing:"+paixing);
                        pai_type = gameLogicRemote.classPai(paixing);
                        playerId = roomInfo.location1.split('*')[0];
                        break;
                    case 2:
                        //console.log("roomInfo.pai:"+roomInfo.pai2);
                        paixing = gameLogicRemote.sortPai(JSON.parse(roomInfo.pai2));
                        //console.error("paixing:"+paixing);
                        pai_type = gameLogicRemote.classPai(paixing);
                        playerId = roomInfo.location2.split('*')[0];
                        break;
                    case 3:
                        //console.log("roomInfo.pai:"+roomInfo.pai3);
                        paixing = gameLogicRemote.sortPai(JSON.parse(roomInfo.pai3));
                        //console.error("paixing:"+paixing);
                        pai_type = gameLogicRemote.classPai(paixing);
                        playerId = roomInfo.location3.split('*')[0];
                        break;
                    case 4:
                        //console.log("roomInfo.pai:"+roomInfo.pai4);
                        paixing = gameLogicRemote.sortPai(JSON.parse(roomInfo.pai4));
                        //console.error("paixing:"+paixing);
                        pai_type = gameLogicRemote.classPai(paixing);
                        playerId = roomInfo.location4.split('*')[0];
                        break;
                    case 5:
                        //console.log("roomInfo.pai:"+roomInfo.pai5);
                        paixing = gameLogicRemote.sortPai(JSON.parse(roomInfo.pai5));
                        //console.error("paixing:"+paixing);
                        pai_type = gameLogicRemote.classPai(paixing);
                        playerId = roomInfo.location5.split('*')[0];
                        break;
                    default:
                        pai_type = 2;
                }
                var endPai = {
                    route:'onEndPai',
                    location1:roomInfo.pai1,
                    location2:roomInfo.pai2,
                    location3:roomInfo.pai3,
                    location4:roomInfo.pai4,
                    location5:roomInfo.pai5,
                    winner_pai:pai_type
                };
                channel.pushMessage(endPai);
                //减玩家金币，根据回调，成功以后才能进行下面的(这里是增加胜利者金币)

                gameDao.getAllChip(rid,function(err,all_chip){
                    playerDao.setGold(playerId,all_chip,function(err,res){
                        console.log('-------fapai subGold------');
                        gameDao.resetData(rid,function(err){

                            gameDao.getRoomInfo(rid,function(err,roomInfo){
                                async.parallel([
                                        function(callback){
                                            if(roomInfo.location1 != "null"){
                                                var playerId = parseInt(roomInfo.location1.split('*')[0]);
                                                gameLogicRemote.detect_gold(app,uid,channel,playerId,rid,function(data){
                                                    callback(null, data);
                                                });
                                            }else{
                                                callback(null, "null");
                                            }
                                        },
                                        function(callback){
                                            if(roomInfo.location2 != "null"){
                                                var playerId = parseInt(roomInfo.location2.split('*')[0]);
                                                gameLogicRemote.detect_gold(app,uid,channel,playerId,rid,function(data){
                                                    callback(null, data);
                                                });
                                            }else{
                                                callback(null, "null");
                                            }
                                        },
                                        function(callback){
                                            if(roomInfo.location3 != "null"){
                                                var playerId = parseInt(roomInfo.location3.split('*')[0]);
                                                gameLogicRemote.detect_gold(app,uid,channel,playerId,rid,function(data){
                                                    callback(null, data);
                                                });
                                            }else{
                                                callback(null, "null");
                                            }
                                        },
                                        function(callback){
                                            if(roomInfo.location4 != "null"){
                                                var playerId = parseInt(roomInfo.location4.split('*')[0]);
                                                gameLogicRemote.detect_gold(app,uid,channel,playerId,rid,function(data){
                                                    callback(null, data);
                                                });
                                            }else{
                                                callback(null, "null");
                                            }
                                        },
                                        function(callback){
                                            if(roomInfo.location5 != "null"){
                                                var playerId = parseInt(roomInfo.location5.split('*')[0]);
                                                gameLogicRemote.detect_gold(app,uid,channel,playerId,rid,function(data){
                                                    callback(null, data);
                                                });
                                            }else{
                                                callback(null, "null");
                                            }
                                        }
                                    ],
                                    function(err, results){
                                        //console.log("async parallel"+JSON.stringify(results[0]));
                                        //console.log("async parallel"+results);
                                        //channelService.pushMessageByUids('onInit',results,[{uid:uid,sid:sid}]);
                                        //return results;
                                        setTimeout(function(){
                                            gameLogicRemote.fapai(app,uid,rid,channel,channelService,playerId,function(){
                                                console.log("gameLogic cb");
                                            });
                                        },10000);
                                    });
                            });

                        });
                    });
                });
            });
        }
    });

};


