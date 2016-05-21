/**
 * Created by wuningjian on 3/22/16.
 */
var gameDao = require("../../dao/gameDao");
var gameLogicRemote = require("../../game/remote/gameLogicRemote");

module.exports = function(app) {
    return new timeoutHandler(app);
};

var timeoutHandler = function(app) {
    this.app = app;
};

var Handler = timeoutHandler.prototype;

