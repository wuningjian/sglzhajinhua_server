/**
 * Created by WTF on 2016/3/9.
 */

var pomelo = require('pomelo');
var util = require('../util/utils');
var Player =require('../entity/player');
var Task = require('../entity/task');
var Code = require('../consts/code');



var taskDao = module.exports;


taskDao.createTaskTable = function(userId,playerId,cb){
    //insert into user(userId,imei,loginCount,lastLoginTime)value(?,?,?,?)
    console.log('userId','playerId');
    console.log(userId,playerId);
    var sql = 'insert into task(taskId,userId,playerId)value(?,?,?)';
    var taskId = Number(Date.now());
    var args = [taskId,userId,playerId];

    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log('taskDao.createTaskTable','fail');
            console.log(err);
            util.invokeCallback(cb,err.message,null);
            return ;
        }else{
            var rs = res[0];
            taskDao.getTaskByTaskId(taskId,cb);
        }
    })
};

taskDao.getTaskByTaskId = function(taskId,cb){
    console.log('cd taskDao.getTaskByTaskId','');
    var sql = 'select * from task where taskId = ?';
    var args = [taskId];

    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log('taskDao.getTaskByTaskId from db','fail');
            console.log(err);
            util.invokeCallback(cb,err.message,null);
            return ;
        }else{
            console.log('taskDao.getTaskByTaskId from db','ok');
            var rs = res[0];
            console.log(JSON.stringify(rs));
            console.log(rs.taskId,'taskId');//taskId

            if(!!rs){
                util.invokeCallback(cb,null,new Task(rs));
            }else{
                util.invokeCallback(cb,'no taskbytaskid',null);
            }

        }
    })
};
/**
 * 获取每日任务
 * @param playerId
 * @param cb
 */
taskDao.getDailyTaskByPlayerId = function(playerId,cb){
    console.log('cd playerDao.getDailyTaskByPlayerId','ok:');
    var sql = 'select * from task where playerId = ?';
    var args = [playerId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(err){console.log(err);
            util.invokeCallback(cb,err.message,null);
            return ;
        }else{
            console.log('cd playerDao.getDailyTaskByPlayerId from db','ok');
            var rs = res[0];
            //util.invokeCallback(cb,null,new Task(rs));
            cb(err,new Task(rs));
        }
    });

};

/**
 * 赢一局:玩牌次数加一，赢牌次数加一
 * @param userId
 * @param cb
 */
taskDao.setWinByUserId = function(userId,cb){
    var sql = 'update task set winTimes = winTimes + 1,playTimes=playTimes + 1';
    var args = [];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(err){
            util.invokeCallback(cb,err.message,null);
            return ;
        }else{
            var rs = res[0];
            util.invokeCallback(cb,null,Code.OK);
        }
    });
};


taskDao.setWinByPlayerId = function(playerId,cb){
    var sql = 'update task set winTimes = winTimes + 1,playTimes=playTimes + 1 where playerId = ?';
    var args = [playerId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(err){
            console.error('taskDao',err);
            util.invokeCallback(cb,err.message,null);
            //return ;
        }else{
            //var rs = res[0];
            util.invokeCallback(cb,null,Code.OK);
        }
    });
}
/**
 * 输一局:玩牌次数加一，输牌次数加一
 * @param userId
 * @param cb
 */
taskDao.setLoseByUserId = function(userId,cb){
    var sql = 'update task set loseTimes = loseTimes + 1,playTimes=playTimes + 1 where userId = ?';
    var args = [userId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log('taskDao.setLoseByUserId',err);
            util.invokeCallback(cb,err.message,null);
        }else{
            util.invokeCallback(cb,null,Code.OK);
        }
    });
};

taskDao.setLoseByPlayerId = function(playerId,cb){
    var sql = 'update task set loseTimes = loseTime +1,playTimes + 1 where playerId =?';
    var args = [playerId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log('taskDao.setLoseByPlayerId',err);
            util.invokeCallback(cb,err.message,null);
        }else{
            util.invokeCallback(cb,null,Code.OK);
        }
    });
}

/**
 * AllIn次数：AllIn次数加一
 * @param userId
 * @param cb
 */
taskDao.setAllInTimesByUserId = function(userId,cb){
    var sql = 'update task set allInTimes = allInTimes + 1';
    var args = [];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){

    });
};


taskDao.setAllInTimesByPlayerId = function(playerId,cb){
    var sql = 'update task set allInTimes = allInTimes + 1 where playerId = ?';
    var args =　[playerId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log('taskDao.setAllInTimes',err);
            util.invokeCallback(cb,err.message,null);
        }else{
            util.invokeCallback(cb,null,Code.OK);
        }
    });
}
/**
 * 获取月充值次数
 * @param userId
 * @param cb
 */
taskDao.getMonthRechargeByUserId = function(userId,cb){
    var sql = 'select monthRecharge from task where userId = ?';
    var args = [userId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(err){
            util.invokeCallback(cb,err.message,null);
            return ;
        }else{
            var rs = res[0];
            if(!!rs){
                util.invokeCallback(cb,null,rs.mouthRecharge);
            }else{
                util.invokeCallback(cb,'no MonthRecharge',null);
            }

        }
    });
};

/**
 * 获取月充值次数
 * @param PlayerId
 * @param cb
 */
taskDao.getMonthRechargeByPlayerId = function(playerId,cb){
    var sql = 'select monthRecharge from task where playerId = ?';
    var args = [playerId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(err){
            util.invokeCallback(cb,err.message,null);
            return ;
        }else{
            var rs = res[0];
            if(!!rs){
                util.invokeCallback(cb,null,rs.mouthRecharge);
            }else{
                util.invokeCallback(cb,'no MonthRecharge',null);
            }

        }
    });
};

/**
 * 当天天第一次登录初始化任务
 * @param userId
 * @param flag
 * @param cb
 */
taskDao.setLoginInitByUserId = function(userId,cb){
    var sql = 'update task set loginTimes = 1,playTimes = 0,winTimes=0,allInTimes=0,useHuanpaika=0,' +
        'useJinbika=0,useFanbeika=0 ' +
        'where userId = ?';
    var args = [userId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log(err);
            util.invokeCallback(cb,err.message,null);
        }else{
            util.invokeCallback(cb,null,200);
        }
    });
}

taskDao.updateLoginTimes = function(userId,cb){
    console.log('cd taskDao.updateLoginTime 正常更新登录次数');
    var sql = 'update task set loginTimes = loginTimes+1 where userId = ?';
    var args = [userId];
    pomelo.app.get('dbclient').query(sql,args,function(err,res){
        if(!!err){
            console.log(err);
            util.invokeCallback(cb,err.message,null);
        }else{
            util.invokeCallback(cb,null,200);
        }
    });
}
