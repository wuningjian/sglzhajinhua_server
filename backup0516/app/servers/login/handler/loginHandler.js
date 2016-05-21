/**
 * Created by WTF Wei on 2016/3/24.
 * Function :
 */

var userDao = require('../../../dao/userDao');
var playerDao =require('../../../dao/playerDao');
var taskDao = require('../../../dao/taskDao');
var tokenService = require('../../../util/token');

var Token   = require('../../../util/token');
var secret  = 'secret'

module.exports = function (app) {
    return new Handler(app);
}

var Handler = function (app) {
    this.app = app;
}

var handler = Handler.prototype;

/**
 * login
 * @param msg -- msg.userId msg.password
 * @param session
 * @param next
 * @return user
 */
handler.login = function (msg, session, next) {
    var userId   = msg.userId;
    var password = msg.password;

    //var tokenstr = tokenService.create(userId,Date.now(),"bcadx");
    //console.log(tokenstr,'  token testting');
    //var tokenres = tokenService.parse(tokenstr,"bcadx");
    //console.log("解压结果---",JSON.stringify(tokenres));


    console.log(userId,password+'  ====================userid password===========================');
    if (!userId || !password) {
        next(null,{code: 500, msg: '用户或密码为空'});
        return;
    }

    userDao.getUserById(userId, function (err, user) {
        console.log('loginHandler getUserById user == ',JSON.stringify(user));
        if(!!err){
            console.log(err);
            console.log('userDao.getUserById');
            next(null, {code: 500, msg: 'get user by id err'});
            return ;
        }
        if (!user) {
            console.log('userId / password not exist!');
            next(null, {code: 500, msg: '用户不存在'});
            return;
        }
        if (password !== user.password) {
            // password is wrong
            console.log('password incorrect!');
            next(null, {code: 501, msg: '密码错误'});
            return;
        }
        //更新登录次数和时间
        updateLogin(user);

        var token1 = Token.create(user.userId, Date.now(), secret);
        console.log(token1);
        console.log(userId + '  login ! ');//
        next(null, {code: 200, token:token1 , userId: user.userId});
    });
}


var updateLogin  = function(user){
    //更新登录次数和最后登录时间
    userDao.setLoginOK(user.userId,function(err,code){
        console.log(code);
    });

    //更新连续登录时间
    var lastLT = user.lastLoginTime;
    var lastD = new Date(lastLT);
    var lastDay = lastD.getDate(); //上次登录的日期12号
    var today = (new Date()).getDate(); //现在的日期ag:13号

    console.log('更新记录',lastLT);
    console.log(lastDay);
    console.log(today);

    var isTwoDay = (Date.now() - lastLT) < 2*24*60*60*1000; //少于两天

    //if(lastLT==0 || !isTwoDay){
    //    //重置为1
    //    playerDao.setCLDays(user.userId,false,function(err,res){
    //        if(!err){
    //            console.log('重置连续登录天数1ok');
    //        }
    //    });
    //    return ;
    //}

    console.log('更新记录lastLT',lastLT);
    console.log('lastDay',lastDay);
    console.log('today',today);
    console.log('isTwoDay',isTwoDay);
    console.log('today!=lastDay',today!=lastDay);

    //连续登录 当天第一次登录
    if((today!=lastDay)&&!!isTwoDay){
        console.log('cd 连续登录 当天第一次登录');
        //加一天
        playerDao.setCLDays(user.userId,true,function(err,res){
            if(!err){
                console.log('连续登陆天数加一天ok');
            }
        });

        //重置为
        taskDao.setLoginInitByUserId(user.userId,function(err,res){
            if(!err){
                console.log('setLoginInitByUserId ok');
            }
        });
    }else if(today!=lastDay){ // 非连续登录 当天第一次
        console.log('cd 非连续登录 当天第一次');
        playerDao.setCLDays(user.userId,false,function(err,res){
            if(!err){
                console.log('重置连续登录天数1ok');
            }
        });

        //重置为
        taskDao.setLoginInitByUserId(user.userId,function(err,res){
            if(!err){
                console.log('setLoginInitByUserId ok');
            }
        });
    }else {
        console.log('cd 正常登录更新');
        //task 更新登录次数
        taskDao.updateLoginTimes(user.userId,function(err,res){
            if(!err){
                console.log('updateLoginTimes ok');
            }
        });
    }
}
/**
 * register / login by imei
 * @param msg -- msg.imei
 * @param session
 * @param next
 * @return user
 */
handler.register = function (msg, session, next) {
    var imei = msg.imei;
    if (!imei) {
        next(null, {code: 500, msg: 'imei为空'});
        return;
    }

    userDao.getUserByImei(imei, function (err, user) {
        if (!!err) {
            console.log('userId / password not exist!');
            next(null, {code: 500, msg: 'err'});
            return;
        }
        console.log('loginHandler getUserByImei user == ',JSON.stringify(user));
        if (!user) {
            userDao.createUserByImei(imei, function (err, user) {
                if (!!err) {
                    console.log('createUser err!');
                    next(null, {code: 500, msg: 'err'});
                    return;
                }
                console.log('loginHandler .. ',JSON.stringify(user));
                if (!user) {
                    next(null, {code: 500, msg: 'err'});
                    return;
                }

                next(null, {code: 200, token: Token.create(user.userId, Date.now(), secret), userId: user.userId});

            });
        }else{
            next(null, {code: 200, token: Token.create(user.userId, Date.now(), secret), userId: user.userId});
        }
    });
}