/**
 * Created by WTF Wei on 2016/3/25.
 * Function :
 */

var playerDao = require('../../../dao/playerDao');
var taskDao = require('../../../dao/taskDao');
var Consts = require('../../../consts/consts');

module.exports = function (app) {
    return new Handler(app);
}

var Handler = function (app) {
    this.app = app;
}

var handler = Handler.prototype;

/**
 * 获取task项
 * @param msg msg.taskId = 201~208
 * @param session
 * @param next
 */
handler.getTaskByTaskId = function (msg,session,next) {
    var taskId = msg.taskId;
    if (!!taskId){
        taskDao.getTaskByTaskId(taskId,function (err,task){
            if (!!err){
                console.log();
                next(null,{code:500,msg:'gettask500'});
            }else{
                next(null,{code:200,task:task});
            }
        })
    } else {
        next(null,{code:500,msg:'gettask canshuerr'});
    }
}

/**
 * 完成任务获取金币奖励
 * @param msg
 * @param session
 * @param next
 */
handler.finishTask = function (msg,session,next){
    var flag = msg.flag;
    var playerId = msg.playerId;
    if (!!flag && !!playerId) {
        console.log('cd finishTask');
        var gold = 0;
        playerDao.getPlayerByPlayerId(playerId,function (err,player) {
            if ( !!err ) {
                console.log(err);
                next(null,{code:500});
            } else {
                if (!!player) {
                    var status = player.status;
                    var sA = new Array(6); //有6个系统任务需要标志
                    for(var j=0;j<status.length;j++){
                        sA[j] = 0;
                    }
                    for (var i=0;i<status.length;i++){
                        sA[i] =status[i];
                    }

                    switch (flag) {
                        case Consts.TaskFlag.everydayWin8:
                            gold = 102;
                            break;
                        case Consts.TaskFlag.everydayPlay8:
                            gold = 103;
                            break;
                        case Consts.TaskFlag.everydayAllIn1:
                            gold = 104;
                            break;
                        case Consts.TaskFlag.everydayExchange3:
                            gold = 105;
                            break;
                        case Consts.TaskFlag.everydayFinish:
                            gold = 106;
                            break;
                        case Consts.TaskFlag.systemWin100:  //4

                            if (1==sA[4]){

                            } else {
                                gold = 100;
                                sA[4] = 1;
                            }

                            break;
                        case Consts.TaskFlag.systemWin10000:  //5
                            if (1==sA[5]){

                            } else {
                                gold = 100;
                                sA[5] = 1;
                            }
                            break;
                        case Consts.TaskFlag.systemChu100:
                            gold = 110;
                            break;
                        case Consts.TaskFlag.systemChu1000:
                            gold = 111;
                            break;
                        case Consts.TaskFlag.systemZhong100:
                            gold = 112;
                            break;
                        case Consts.TaskFlag.systemZhong1000:
                            gold = 113;
                            break;
                        case Consts.TaskFlag.systemGao100:
                            gold = 114;
                            break;
                        case Consts.TaskFlag.systemGao1000:
                            gold = 115;
                            break;
                        case Consts.TaskFlag.systemTu100:
                            gold = 116;
                            break;
                        case Consts.TaskFlag.systemTu1000:
                            gold = 117;
                            break;
                        case Consts.TaskFlag.recharge50: //0
                            if (1==sA[0]){
                            } else {
                                gold = 100;
                                sA[0] = 1;
                            }
                            break;
                        case Consts.TaskFlag.recharge500: //1
                            if (1==sA[1]){
                            } else {
                                gold = 100;
                                sA[1] = 1;
                            }
                            break;
                        case Consts.TaskFlag.recharge5000: //2
                            if (1==sA[2]){
                            } else {
                                gold = 100;
                                sA[2] = 1;
                            }
                            break;
                        case Consts.TaskFlag.recharge20000: //3
                            if (1==sA[3]){
                            } else {
                                gold = 100;
                                sA[3] = 1;
                            }
                            break;
                        default:
                            gold = 0;
                            break;
                    }

                    playerDao.addGold(playerId,gold,0,function(err,GAD){
                        if(!!err){
                            console.log(err);
                            next(null,{code:500,msg:'server err'});
                        }else{
                            console.log('finish task and get gold');
                            var g = GAD.gold;
                            if(!!g){
                                playerDao.setStatus(playerId,sA.join('').toString(),function(err,code){
                                    if(code==200){
                                        next(null,{code:200,msg:'ok',gold:g});
                                    }
                                });
                            }else{
                                next(null,{code:500,msg:"server err"});
                            }
                        }
                    });

                } else {
                    next(null,{code:500});
                }
            }
        });
    } else {
        next(null,{code:500,msg:'args err'});
    }
}

/**
 * vip每日领奖 活动公告模块
 * @param msg
 * @param session
 * @param next
 */
handler.eventVipReward = function(msg,session,next){
    var playerId = msg.playerId;
    var vip = msg.vip;
    if(!!playerId&&!!vip){
        var gold = 0;
        if(vip==1){
            gold = 8000;
        }else if(vip==2){
            gold = 10000;
        }else if(vip==3){
            gold = 30000;
        }else if(vip==4){
            gold = 60000;
        }else if(vip==5){
            gold = 200000;
        }else if(vip==6){
            gold = 300000;
        }else if(vip==7){
            gold = 500000;
        }else if(vip==8){
            gold = 800000;
        }else{
            gold = 0;
        }

        playerDao.addGold(playerId,gold,0,function(err,GAD){
            if(!!err){
                console.log(err);
                next(null,{code:500,msg:'服务器错误'});
            }else{
                console.log('eventVipReward');
                var g = GAD.gold;
                if(!!g){
                    next(null,{code:200,msg:'ok',gold:g});
                }else{
                    next(null,{code:500,msg:"服务器错误"});
                }
            }
        });
    }
}

/**
 * 定时奖励
 * @param msg
 * @param session
 * @param next
 */
handler.timingReward = function(msg,session,next){
    var playerId = msg.playerId;
    var flag = msg.flag;
    if(!!playerId&&!!flag){
        var gold = 0;
        var date = new Date();
        var hours = (date.getHours()+date.getMinutes()/60).toFixed(2);
        if(flag==3){
            //8点到9点半
            if(hours>=8&&hours<=19.5){
                gold = 1000;
            }
        }else if(flag==2){
            //12点半到13点半
            if(hours>=12.5&&hours<=13.5){
                gold = 1000;
            }
        }else if(flag==1){
            //18点到19点
            if(hours>=18&&hours<=19){
                gold = 1000;
            }
        }else if(flag===0){
            //21点半到22点半
            if(hours>=21.5&&hours<=22.5){
                gold = 1000;
            }
        }else{
            gold = 0;
        }
        playerDao.setGold(playerId,gold,function(err,code){
            if(err){
                next(null,{code:500});
            }else{
                if(code==200){

                    playerDao.getPlayerByPlayerId(playerId,function(err,player){
                        if(!err){
                            next(null,{code:500,player:player});
                        }else{
                            next(null,{code:200,player:player});
                        }
                    });
                }else{
                    next(null,{code:500});
                }
            }
        });
    }else{
        next(null,{code:500});
    }
}

handler.serverTime = function(msg,session,next){
    console.log('cd getservertime');
    var time = Date.now();
    console.log(time);
    next(null,{code:200,time:time});
}

/**
 * 摇钱树 每两小时增加相应数量  领取金币 摘果
 * @param msg
 * @param session
 * @param next
 */
handler.eventTreeExtract = function (msg, session, next) {
    var playerId = msg.playerId;
    //var flag = msg.flag;

    if (!!playerId) {
        playerDao.treeExtract(playerId,function (err,res) {
            if (!!err) {
                console.log(err);
                next(null,{code:500,msg:' err'});
            } else {
                if (res == 200) {
                    playerDao.getPlayerByPlayerId(playerId,function (err,player) {
                       if (!!err) {
                           console.log(err);
                           next(null,{code:500,msg:'server err'})
                       } else {
                           if (!!player) {
                               var gold = player.gold;
                               next(null,{code:200,msg:'ok',gold:gold });
                           } else {
                               next(null,{code:500,msg:'no gold'})
                           }
                       }
                    });
                }
            }
        });
    } else {
        next(null,{code:500,msg:'args err'})
    }
}

handler.getTree = function (msg, session, next) {
    var playerId = msg.playerId;
    if (!!playerId) {
        playerDao.getPlayerByPlayerId(playerId, function (err,player) {
            if (!!err) {

            } else {
                if (!!player) {
                    var tree = player.tree;
                    next(null,{code:200,msg:'ok',tree:tree});
                } else {
                    next(null,{code:500,msg:'no player'});
                }
            }
        });
    } else {
        next(null,{code:500,msg:'args err'});
    }
}