/**
 * Created by WTF Wei on 2016/3/24.
 * Function :
 */

var Code      = require('../../../consts/code');
var userDao   = require('../../../dao/userDao');
var playerDao = require('../../../dao/playerDao');
var taskDao   = require('../../../dao/taskDao');
var gameDao   = require('../../../dao/gameDao');

var async     = require('async');


module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};


var handler = Handler.prototype;
/**
 * New client entry.
 * 管理用户连接session
 * @param  {Object}   msg  msg.token    request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.entry = function (msg, session, next) {
    var token = msg.token, self = this;
    console.log('entry ok ====token: ',token);
    if (!token) {
        next(new Error('invalid entry request: empty token'), {code: 500,msg:"token empty"});
        return;
    }

    //playerDao.addGold(8,100,0,function(err,res){
    //    console.log("-------log----------");
    //});

    var userId, player, task, USER;
    // waterfall(tasks, [callback]) （多个函数依次执行，且前一个的输出为后一个的输入）(后一个函数即是前一个函数的cb)
    async.waterfall([
        function (cb) {
            console.log("cd waterfall  ***************************");
            console.log('token ',token);
            //auth token
            //token 为登录验证之后
            //取出userId
            self.app.rpc.auth.authRemote.auth(session, token, cb);
        }, function (code, user, cb) {

            console.log('after auth');
            //query player info by user id
            //user = user/null
            if (code !== Code.OK) {
                console.log('验证不成功');
                next(null, {code: code,msg:'code ! = 200'});
                return;
            }

            if (!user) {
                console.log('用户不存在');
                next(null, {code: Code.ENTRY.FA_USER_NOT_EXIST,msg:'user not exist'});
                return;
            }

            userId = user.userId;
            USER =user;
            playerDao.getPlayerByUserId(user.userId, cb);
        }, function (res, cb) {
            console.log('after getplayer--- ');
            // generate session and register chat status
            player = res;
            self.app.get('sessionService').kick(userId, cb);
        }, function (cb) {
            //session.bind(userId, cb);
            cb();
        }, function (cb) {
            if (!player) {
                next(null, {code: Code.OK});
                return;
            }
            //var playerId = player.playerId;
            //session.bind(playerId);
            //session.set('playerId', player.playerId);
            //监听断线情况 回调
            //session.on('closed', onUserLeave.bind(null, self.app));
            //session.pushAll(cb);

            taskDao.getDailyTaskByPlayerId(player.playerId,cb);
            session.set('playerId', player.playerId);
            session.push('playerId', function(err) {
                if(err) {
                    console.error('set rid for session service failed! error is : %j', err.stack);
                }
            });
        }, function (res,cb) {
            task = res;
            if(!task){
                next(null, {code: Code.OK});
                return;
            }

            console.log('get all data player user task');
            //cb();//执行最后一个函数
            next(null,{code:Code.OK,msg:'get user player task ok',initdata:{user:USER,player:player,task:task}});
            //self.app.rpc.chat.chatRemote.add(session, player.userId, player.name,
            //    channelUtil.getGlobalChannelName(), cb);
        }
    ], function (err) {
        if (err) {
            next(err, {code: Code.FAIL,msg:'waterfall err'});
            return;
        }
        console.log('get all data player user task');
        //next(null,{code:Code.OK,msg:'get user player task ok',initdata:{user:USER,player:player,task:task}});
        //next(null, {code: Code.OK, player: player});
    });

};

handler.enter = function(msg, session, next) {
    var self = this;
    gameDao.returnRoom(msg.basicChip, function(err,res){

        console.log("cb res"+res);

        var rid = res.toString();

        var uid = msg.username + '*' + rid;
        //var uid = msg.username;
        //var sessionService = self.app.get('sessionService');
        //if( !! sessionService.getByUid(uid)) {
        //    next(null, {
        //        code: 500,
        //        error: true
        //    });
        //    return;
        //}
        session.bind(uid);
        session.set('rid', rid);
        session.push('rid', function(err) {
            if(err) {
                console.error('set rid for session service failed! error is : %j', err.stack);
            }
        });

        session.set('readyNum',0);
        session.push('readyNum',function(err){
            if(err){
                console.error('enterHandler:set readyNum for session service failed! error is : %j', err.stack);
            }
        });

        session.on('closed', onUserLeave.bind(null, self.app));
        self.app.rpc.game.gameRemote.add(session, uid, self.app.get('serverId'), rid, true, function(location){
            next(null, {
                //users:users,
                //rid:rid
                location:location
            });
            //gameDao.getRoomInfo(rid,function(res){
            //	next(null, {
            //		//users:users,
            //		//rid:rid
            //		location:location,
            //		roomInfo:res
            //	});
            //});

        });
    });
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
    if(!session || !session.uid) {
        return;
    }
    //app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
    app.rpc.game.gameRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
};

