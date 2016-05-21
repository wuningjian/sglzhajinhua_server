/**
 * Created by WTF on 2016/3/10.
 */
var util = require('../util/utils');
var Redis = require('ioredis');
var redis = new Redis();

var delayDao = module.exports;

//delayDao = function(){
//    delayDao.startListener();
//};

/**
 * 添加计划定时消息 -- 消息可以是pomelo的channel -- 房间号字符串
 * @param channel
 * @param timeout 过期时间
 * @param cb  回调
 */
delayDao.addDelay = function(channel,timeout,cb){
    var code = 200;
    redis.select(9,function(err){
        if(err) {
            code=500;
            console.log('select9',code)
            util.invokeCallback(cb,err,code);
        }
        redis.multi()
            .set(channel, 'content')
            .expire(channel, timeout)
            .exec(function(err) {
                console.log(channel,timeout);
                if(err) {
                    code = 500;
                    console.error("添加计划事件失败 : " + 'content');
                    //console.error(err);
                    util.invokeCallback(cb,err,code);
                    return;
                }else{
                    util.invokeCallback(cb,null,code);
                }
            });
    });
};

delayDao.removeDelay = function(channel,cb){
    redis.select(9, function(err) {
        if(err) process.exit(4);
        redis.del(channel,function(err){});
        cb();
    });
};

/**
 * 启动监听
 */
delayDao.startListener = function(){
    //
    redis.select(9, function(err) {
        if(err) process.exit(4);
        redis.subscribe("__keyevent@9__:expired", function() {
            console.log("订阅过期频道成功");
        });
        redis.subscribe("__keyevent@9__:del",function(){
            console.log("订阅删除频道成功");
        });
    });

    // 监听从 `订阅频道` 来的消息
    redis.on("message", function(sub,key){
        //console.log('get message');
        console.log(sub,key+'被删除了/已过期了');
        //example key表示pomelo的一个channel名(也就是addDelay传入的channel参数)，获取channel之后，向该channel发送消息

    });
};

delayDao.stopDelay = function(){
    redis.select(9, function(err) {
        redis.unsubscribe("__keyevent@9__:expired", function() {
            //console.log("退订过期频道成功");
        });
        redis.unsubscribe("__keyevent@9__:del", function() {
            //console.log("退订删除频道成功");
        })
    });
};

