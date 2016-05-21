/**
 * Created by wuningjian on 3/21/16.
 */
var gameDao = require('../../../dao/gameDao');
var pomelo = require('pomelo');
var gameLogicRemote = require('./gameLogicRemote');

module.exports = function(app){
    return new timeoutRemote(app);
};

var timeoutRemote = function(app){
    this.app = app;
    this.channelService = app.get('channelService');
};

timeoutRemote.prototype.timeoutThrow = function(num,cb){
    console.log("timeoutRemote Throw"+num);
    cb();
};
