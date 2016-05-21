/**
 * Created by WTF on 2016/2/25.
 */
var User = require('../entity/user');       //用户类 --用于登录验证
var Player = require('../entity/player');   //玩家类 --玩家游戏数据
var utils  = require('../util/utils');
var pomelo = require('pomelo');
var Code = require('../consts/code');


//直接暴露模块的方法使用时无需在new
var userDao = module.exports;

var self = this;
/**
 *通过用户名称获取用户---
 * @param userName
 * @param cb
 */
userDao.getUserByName = function (userName, cb) {
    console.log('cd userDao.getUserByName', '')
    var sql  = 'select * from user where userName = ?';
    var args = [userName];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (!!err) {
            console.error(err);
            utils.invokeCallback(cb, err.message, null);
        } else {

            console.log('LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL');
            console.log(res);
            if (!!res&& res.length === 1) {
                var rs   = res[0];
                console.log(JSON.stringify(rs));
                utils.invokeCallback(cb, null, new User(rs));
            } else {
                utils.invokeCallback(cb, null, null);
            }
        }
    });
};

userDao.getUserById = function (userId, cb) {
    console.log('cd userDao.getUserById ', userId);
    var sql  = 'select * from user where userId = ?';
    var args = [userId];
    //pomelo.app.get('dbclient').query
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            console.log(err);
            console.log('userDao.getUserById pomelo.app.get err');
            utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length === 1) {
                console.log('cd userDao.getUserById from db', 'ok');
                var rs   = res[0];
                //console.log()
                //var user = new User({
                //    userId: rs.userId,
                //    userName: rs.userName,
                //    imei: rs.imei,
                //    password: rs.password,
                //    loginCount: rs.loginCount,
                //    lastLoginTime: rs.lastLogingTime
                //});
                utils.invokeCallback(cb, null, new User(rs));
            } else {
                console.log('userDao.getUserById pomelo.app.get user not exist');
                utils.invokeCallback(cb, ' user not exist ', null);
            }
        }
    });
};

userDao.getUserByImei = function (imei, cb) {
    console.log('cd userDao.getUserByImei', 'imei:' + imei);
    var sql  = 'select * from user where imei = ?';
    var args = [imei];
    pomelo.app.get('dbclient').insert(sql, args, function (err, res) {
        if (err !== null) {
            console.log('getUserByImei query err');
            utils.invokeCallback(cb, err.message, null);
        } else {
            console.log('cd userDao.getUserByImei from db', 'ok:');
            var rs = res[0];
            if (!!rs) {
                utils.invokeCallback(cb, null, new User(rs));
            } else {
                utils.invokeCallback(cb, null, null);
            }


            //console.log('getUserByImei get user fail --- user not exist');
        }
    });
};

/**
 *
 * @param imei 手机IMEI号
 * @param cb
 * @return user
 */
userDao.createUserByImei = function (imei, cb) {

    var sql       = 'insert into user(imei,loginCount,lastLoginTime) values(?,?,?)';
    var loginTime = Date.now();
    //var userId    = Date.now();
    var args      = [imei, 1, loginTime];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            console.log('userDao.createrUser by imei err');
            console.log(err.message);//ER_DUP_ENTRY: Duplicate entry '' for key 'INDEX_ACCOUNT_USERNAME'
            console.log(err);
            utils.invokeCallback(cb, err.message, null);
        } else {
            var rs = res[0];
            console.log('--------------insertId');
            console.log(res.insertId)
            console.log('userDao creater by imei ok  user: ');
            console.log(JSON.stringify(rs));
            userDao.getUserById(res.insertId, cb);
        }
    });
};


/**
 *--------------
 * @param playerId
 * @param playerInfo
 * @param cb
 */
userDao.updatePlayerInfo = function (playerId, playerInfo, cb) {
    var gender    = playerInfo.gender;
    var signature = playerInfo.signature;
    var nickName  = playerInfo.nickName;
    var sql       = '';
    var args      = [gender, signature, nickName];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            utils.invokeCallback(cb, err.message, null);
            //return;
        } else {
            if (!res || res.length <= 0) {
                utils.invokeCallback(cb, null, []);
                //return;
            } else {
                var rs = res[0];
                utils.invokeCallback(cb, null, new Player(rs));
            }
        }
    });
};

/**
 *
 * @param userId
 * @param password
 * @param cb
 */
userDao.login = function (userId, password, cb) {
    console.log('cd userDao.login', userId + ' : ' + password)
    var sql  = 'select * from user where userId =?';
    var args = [userId];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            utils.invokeCallback(cb, err.message, null);
        } else {
            if (!res || res.length <= 0) {
                utils.invokeCallback(cb, null, []);
                //return;
            } else {
                var rs = res[0];
                if (rs.password == password) {
                    utils.invokeCallback(cb, null, new User(rs));
                } else {
                    utils.invokeCallback(cb, '用户不存在或密码错误', []);
                    //return;
                }
            }
        }
    });
};


/**
 * 设置唯一用户名
 * 完善用户账号场景
 * @param userId
 * @param userName
 * @param cb
 */
userDao.setUserName = function (userId, userName,password, cb) {
    var sql  = 'update user set userName = ?,password = ? where userId = ? ';
    var args = [userName,password,userId];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if(!!err){
            console.log(err);
            utils.invokeCallback(cb,err.message,null);
        }else{
            utils.invokeCallback(cb,null,200);
        }
    });
};

/**
 * 登录成功之后更新用户统计信息 登录次数 最后登录时间
 * @param userId
 * @param cb
 */
userDao.setLoginOK = function(userId,cb){
    var sql = 'update user set loginCount = loginCount + 1,lastLoginTime = ? where userId = ?';
    var time = Date.now();
    var args = [time,userId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log(self.name.toString(),err);
            utils.invokeCallback(cb,err,message,null);
            return ;
        }else{
            utils.invokeCallback(cb,null,Code.OK);
        }
    });
}