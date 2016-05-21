/**
 * Created by WTF on 2016/3/9.
 */
var Player  = require('../entity/player');
var Store    = require('../entity/store');
var taskDao = require('./taskDao');
var pomelo  = require('pomelo');
var utils   = require('../util/utils');
var Code = require('../consts/code');


var playerDao = module.exports;


/**
 * ----------无用了
 * 初始化用户时--同时初始化玩家账户
 * @param userId
 * @param nickName
 * @param cb
 */
playerDao.createPlayerByUserId = function (userId, nickName, cb) {
    console.log('cd playerDao.createPlayerByUserId', userId + ' nickname ' + nickName);
    var sql        = 'insert into player(userId,nickName,createTime,continueLoginDays) value(?,?,?,?,?)';
    var createTime = Date.now();
    var args       = [userId, nickName, createTime, 1];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            console.log('createPlayerByUserId into player table db fail');
            utils.invokeCallback(cb, err.message, null);
        } else {
            var rs = res[0];
            playerDao.getPlayerByPlayerId(res.insertId, cb);
        }
    });
};

/**
 * 获取玩家数据 by playerid
 * @param playerId
 * @param cb
 */
playerDao.getPlayerByPlayerId = function (playerId, cb) {
    console.log(playerId,' <- playerId');
    var sql  = 'select * from player where playerId =?';
    var args = [playerId];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            utils.invokeCallback(cb, err.message, null);
        } else {
            console.log(playerId);
            console.log('palyerDao.getPlayerByPlayerId', 'res' + res[0]);
            var rs = res[0];
            /*
             var player = new Player({playerId: rs.playerId, userId: rs.userId,password:rs.password,gender:rs.gender,
             nickName:rs.nickName,createTime:rs.createTime,signature:rs.signature,level:rs.level,vip:rs.vip,
             playTimes:rs.playTimes,
             winTimes:rs.winTimes,loseTime:rs.loseTimes,rate:rs.rate,gold:rs.gold,diamond:rs.diamond,onlineDays:rs.onlineDays,
             portrait:rs.portrait,jinBiKa:rs.jinBiKa,huangPaiKa:rs.huangPaiKa,fangBeiKa:rs.fangBeiKa});
             */
            if (!!rs) {
                utils.invokeCallback(cb, null, new Player(rs));
            } else {
                utils.invokeCallback(cb, 'no player By playerId', null);
            }
        }
    });
};


/**
 * 通过用户id获取玩家数据
 * @param uid
 * @param cb
 */
playerDao.getPlayerByUserId = function (userId, cb) {
    console.log('cd playerDao.getPlayerByUserId');
    var sql  = 'select * from player where userId = ?';
    var args = [userId];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (!!err) {
            console.log('playerDao.getPlayerByUserId', 'fail');
            utils.invokeCallback(cb, err.message, null);
            //return;
        } else {
            console.log('cd playerDao.getPlayerByUid from db', 'ok');
            var rs = res[0];
            if (!!rs) {
                utils.invokeCallback(cb, null, new Player(rs));
            } else {
                utils.invokeCallback(cb, 'no playerByUid', null);
            }

        }
    });
};

/**
 * 更改用户 昵称、签名、性别、   ---未完工
 * @param userInfo  gender = 1 男  2女
 * @param cb
 */
playerDao.updatePlayerInfo = function (playerId,signature, gender, nickName, cb) {
    var sql = 'update player set signature = ?,gender = ?,nickName = ? where playerId = ?';
    var args = [signature, gender, nickName, playerId];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, Code.OK);
        }
    });
};

/**
 * 设置status 系统领奖状态
 * @param userId
 * @param flag
 * @param cb
 */
playerDao.setStatus = function(playerId,status,cb){
    var sql = 'update player set status = ? where playerId = ?';

    var args = [status,playerId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log('playerDao.setCLDays',err);
            utils.invokeCallback(cb,err.message,null);
        }else{
            utils.invokeCallback(cb,null,Code.OK);
        }
    });
}

/**
 * 设置连续登录天数  用户登录时设置
 * @param userId
 * @param flag
 * @param cb
 */
playerDao.setCLDays = function(userId,flag,cb){
    var sql = 'update player set continueLoginDays = 1 where userId = ?';
    if(flag){
        sql = 'update player set continueLoginDays = continueLoginDays + 1 where userId = ?';
    }
    var args = [userId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log('playerDao.setCLDays',err);
            utils.invokeCallback(cb,err.message,null);
        }else{
            utils.invokeCallback(cb,null,Code.OK);
        }
    });
}

/**
 * 使用钻石购买金币
 * @param playerId
 * @param gold 正数为增加金币
 * @param diamond  负数消耗钻石
 * @param cb
 */
playerDao.addGold = function (playerId, gold, diamond, cb) {
    console.log(playerId,gold);
    console.log(diamond);
    //console.log('cd playerDao.addGold dao',playerId);
    var sql  = 'update player set gold = gold + ?, diamond = diamond + ? where playerId = ?';
    var args = [gold, diamond, playerId];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            console.log('出错喽哦货');
            utils.invokeCallback(cb,err,null);
        } else {
            console.log('')
            console.log('save gold ok');
            playerDao.getPlayerByPlayerId(playerId, function (err, res) { //res == player
                if (err) {
                    console.log('出错喽哦货2');
                    utils.invokeCallback(cb,err.message,null);
                } else {
                    var rs = res;
                    console.log('gold -- - - - --'+rs.gold,rs.diamond);
                    if (!!rs) {
                        console.log('cd playerDao.addGold get gold');
                        var GAD = {
                            gold: rs.gold,
                            diamond: rs.diamond
                        };
                        utils.invokeCallback(cb, null, GAD);
                    }
                }
            });
        }
    });
};

playerDao.setHuanPaiKa = function(playerId,huanPaiKa,cb){
    var sql = 'update player set huanPaiKa = huanPaiKa + ?where playerId = ?';
    var args = [huanPaiKa,playerId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log(err);
            utils.invokeCallback(cb,err.message,null);
        }else{
            utils.invokeCallback(cb,null,Code.OK);
        }
    });
}

playerDao.setFanBeiKa = function(playerId,fanBeiKa,cb){
    var sql = 'update player set fanBeiKa = fanBeiKa + ? where playerId = ?';
    var args = [fanBeiKa,playerId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log(err);
            utils.invokeCallback(cb,err.message,null);
        }else{
            utils.invokeCallback(cb,null,Code.OK);
        }
    });
}

playerDao.setJinBiKa = function(playerId,jinBiKa,cb){
    var sql = 'update player set jinBiKa = jinBiKa + ? where playerId = ?';
    var args = [jinBiKa,playerId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log(err);
            utils.invokeCallback(cb,err.message,null);
        }else{
            utils.invokeCallback(cb,null,Code.OK);
        }
    });
}

playerDao.setEquip = function(playerId,equip,number,cb){
    var sql = 'update player set jinBiKa = jinBiKa + ? where playerId = ?';
    if(equip==2){
        sql = 'update player set huanPaiKa = huanPaiKa + ? where playerId = ?';
    }else if(equip==3){
        sql = 'update player set fanBeiKa = fanBeiKa + ? where playerId = ?';
    }
    var args = [number,playerId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log(err);
            utils.invokeCallback(cb,err.message,null);
        }else{
            utils.invokeCallback(cb,null,Code.OK);
        }
    });
}

playerDao.buyGift = function(playerId,gift,number,cb){
    var sql = 'update player set gift01 = gift01 + ? where playerId = ?';
    if(gift==2){
        sql = 'update player set gift02 = gift02 + ? where playerId = ?';
    }else if(gift==3){
        sql = 'update player set gift03 = gift03 + ? where playerId = ?';
    }else if(gift ==4){
        sql = 'update player set gift04 = gift04 + ? where playerId = ?';
    }else if(gift ==5){
        sql = 'update player set gift05 = gift05 + ? where playerId = ?';
    }
    var args = [number,playerId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log(err);
            utils.invokeCallback(cb,err.message,null);
        }else{
            utils.invokeCallback(cb,null,Code.OK);
        }
    });
}

playerDao.buyDiamond = function(playerId,number,cb){
    var sql = 'update player set diamond = diamond + ? where playerId = ?';
    var args = [number,playerId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log(err);
            utils.invokeCallback(cb,err.message,null);
        }else{
            utils.invokeCallback(cb,null,Code.OK);
        }
    });
}

playerDao.getStore = function(cb){
    var sql = 'select * from store';
    var args =[];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log(err);
            utils.invokeCallback(cb,err.message,null);
        }else{
            utils.invokeCallback(cb,null,res);
        }
    });
}

playerDao.getStoreItem = function (itemId,cb){
    var sql = 'select * from store where itemId = ?';
    var args = [itemId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if (!!err){
            console.log(err);
            utils.invokeCallback(cb,err.message,null);
        }else{
            var rs = res[0];
            if(!!!rs){
                utils.invokeCallback(cb,'no item exist',null);
            }else{
                utils.invokeCallback(cb,null,new Store(rs));
            }
        }
    });
}

/**
 * 购买商品
 * @param playerId
 * @param tag 商品标签
 * @param cb
 */
playerDao.storeBuy = function(playerId,tag,cb){
    var sql = 'update player set gift01 = gift01 + ,gold=gold- where playerId = ?';
    if(tag==3){
        sql = 'update player set gift01 = gift01 +1 ,gold=gold-5000 where playerId = ?';
    }else if(tag ==10){
        sql = 'update player set gift02 = gift02 +1 ,gold=gold-20000 where playerId = ?';
    }else if(tag ==11){
        sql = 'update player set gift03 = gift03 +1 ,gold=gold-200000 where playerId = ?';
    }else if(tag ==12){
        sql = 'update player set gift04 = gift04 +1 ,gold=gold-500000 where playerId = ?';
    }else if(tag ==13){
        sql = 'update player set gift05 = gift05 +1 ,gold=gold-1000000 where playerId = ?';
    }else if(tag ==110){
        sql = 'update player set diamond=diamond + 5 where playerId = ?';
    }else if(tag ==111){
        sql = 'update player set diamond=diamond + 10 where playerId = ?';
    }else if(tag ==112){
        sql = 'update player set diamond=diamond + 32 where playerId = ?';
    }else if(tag ==113){
        sql = 'update player set diamond=diamond + 59 where playerId = ?';
    }else if(tag ==120){
        sql = 'update player set diamond=diamond + 128 where playerId = ?';
    }else if(tag ==121){
        sql = 'update player set diamond=diamond + 724 where playerId = ?';
    }else if(tag ==122){
        sql = 'update player set diamond=diamond + 1600 where playerId = ?';
    }else if(tag ==123){
        sql = 'update player set diamond=diamond + 3300 where playerId = ?';
    }else if(tag ==1){
        sql = 'update player set huanPaiKa=huanPaiKa + 5,diamond=diamond - 5 where playerId = ?';
    }else if(tag ==0){
        sql = 'update player set huanPaiKa=huanPaiKa + 5,diamond=diamond - 5 where playerId = ?';
    }else if(tag ==2){
        sql = 'update player set huanPaiKa=huanPaiKa + 65,diamond=diamond - 50 where playerId = ?';
    }else if(tag ==20){
        sql = 'update player set gold=gold + 50000,diamond=diamond - 5 where playerId = ?';
    }else if(tag ==21){
        sql = 'update player set gold=gold + 100000,diamond=diamond - 10 where playerId = ?';
    }else if(tag ==22){
        sql = 'update player set gold=gold + 324000,diamond=diamond - 30 where playerId = ?';
    }else if(tag ==23){
        sql = 'update player set gold=gold + 590000,diamond=diamond - 50 where playerId = ?';
    }else if(tag ==100){
        sql = 'update player set gold=gold + 1280000,diamond=diamond - 100 where playerId = ?';
    }else if(tag ==101){
        sql = 'update player set gold=gold + 7900000,diamond=diamond - 500 where playerId = ?';
    }else if(tag ==102){
        sql = 'update player set gold=gold + 1600000,diamond=diamond - 1000 where playerId = ?';
    }else if(tag ==103){
        sql = 'update player set gold=gold + 33000000,diamond=diamond - 2000 where playerId = ?';
    }else{
        sql = '';
    }
    var args = [playerId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log(err);
            utils.invokeCallback(cb,err.message,null);
        }else{
            playerDao.getPlayerByPlayerId(playerId,function(err,player){
                if(!!err){
                    console.log(err);
                    utils.invokeCallback(cb,err.message,null);
                }else{
                    utils.invokeCallback(cb,null,player);
                }
            });
        }
    });
}

playerDao.feedback = function(playerId,title,content,cb){
    var sql ='insert into feedback(playerId,title,content)values(?,?,?)';
    var args =[playerId,title,content];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log(err);
            utils.invokeCallback(cb,err.message,null);
        }else{
            utils.invokeCallback(cb,null,200);
        }
    });
}

/**
 * 增加金币
 * @param playerId
 * @param gold
 * @param cb
 */
playerDao.setGold = function(playerId,gold,cb){
    var sql = 'update player set gold = gold + ? where playerId =?';
    var args =[gold,playerId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log(err);
            utils.invokeCallback(cb,err.message,null);
        }else{
            utils.invokeCallback(cb,null,200);
        }
    });
};

//扣除玩家金币 subN -》扣除数量
playerDao.subGold = function (playerId,subN,cb) {
    var sql = 'update player p set p.gold = p.gold - ? where playerId=? and p.gold >= ? ';
    var args = [subN,playerId,subN];
    pomelo.app.get('dbclient').query(sql,args,function (err,res) {
        if (!!err) {
            console.log(err); utils.invokeCallback(cb,err.message,null);
        } else {
            var res = res;
            if (res.affectedRows>=1){
                //成功
                utils.invokeCallback(cb,null,200);
            } else {
                //失败
                utils.invokeCallback(cb,null,500);
            }
        }
    });
};


playerDao.treeExtract = function (playerId,cb) {
    var sql = 'update player p set p.gold = p.gold + p.tree, p.tree = 0 where p.recharge >= 10 and p.playerId = ?';
    var args = [playerId];
    pomelo.app.get('dbclient').query(sql,args,function (err,res) {
        if (!!err) {
            console.log(err);
            utils.invokeCallback(cb,err.message,null);
        } else {
            utils.invokeCallback(cb,null,200);
        }
    })
}