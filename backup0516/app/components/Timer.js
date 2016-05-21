/**
 * Created by WTF on 2016/3/9.
 */
var Redis = require('ioredis');
var redis = new Redis();


module.exports = function (app, opts) {
    return new Timer(app, opts);
};


var DEFAULT_INTERVAL = 3000;

var Timer = function (app, opts) {
    this.app = app;
    this.interval = opts.interval || DEFAULT_INTERVAL;
    this.timerId = null;
};

Timer.name = '__Timer__';

Timer.prototype.start = function (cb) {
    console.log('Timer Start');
    var self = this;

    process.nextTick(cb);
}

Timer.prototype.afterStart = function (cb) {
    var self = this;
    console.log('Timer World afterStart');
    redis.select(9, function(err) {
        if(err) process.exit(4);
        redis.subscribe("__keyevent@9__:expired", function() {
            console.log("--------add expired channel ok");
        });
        redis.subscribe("__keyevent@9__:del",function(){
            console.log("--------add del channel ok");
        });
    });

    // 监听从 `订阅频道` 来的消息
    redis.on("message", function(sub,key){
        //console.log('get message');
        console.log(sub,key+'del-------expiredc');
        //example key表示pomelo的一个channel名(也就是addDelay传入的channel参数)，获取channel之后，向该channel发送消息
        self.app.rpc.chat.chatRemote.ok(function(code){
            console.log('msg',code);
        });

    });
    process.nextTick(cb);
}

Timer.prototype.stop = function (force, cb) {
    console.log('Timer World stop');
    clearInterval(this.timerId);
    process.nextTick(cb);
}