/**
 * Created by WTF on 2016/3/9.
 */
var Player  = require('../entity/player');
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

//设置连续登录天数
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
};

/**
 * setGold
 * @param playerId
 * @param gold
 * @param diamond
 * @param cb
 */
playerDao.addGold = function (playerId, gold, diamond, cb) {
    console.log('cd playerDao.addGold dao',playerId);
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

/**
 *
 * @param playerId
 * @param cb
 */
playerDao.getGold = function (playerId,cb){
    console.log('cd playerDao.getGold dao',playerId);
    var sql  = 'select * from player where playerId = ?';
    var args = [playerId];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            console.log('出错喽哦货');
            utils.invokeCallback(cb,err,null);
        } else {
            utils.invokeCallback(cb, null, res[0].gold);
        }
    });
};




