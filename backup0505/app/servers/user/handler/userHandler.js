/**
 * Created by WTF Wei on 2016/3/25.
 * Function :
 */

var playerDao = require('../../../dao/playerDao');
module.exports = function (app) {
    return new Handler(app);
}

var Handler = function (app) {
    this.app = app;
}

var handler = Handler.prototype;


handler.updateInfo = function (msg, session, next) {
    //console.log('')
    var playerId  = msg.playerId;
    var signature = msg.signature;
    var gender    = msg.gender;
    var nickName  = msg.nickName;
    console.log('handler.updateInfo id signature gender nickname', playerId + signature + gender + nickName);
    //"playerId":1458009829560,"signature":"脚后跟扣货款","gender":1,"nickName":"mx4"
    if (!!playerId && !!signature && !!gender && !!nickName) {
        playerDao.updatePlayerInfo(msg.playerId, signature, gender, nickName, function (err, res) {
            if (err) {
                console.log(err.message + '===========err============');
                console.log(err);
                next(null, {
                    code: 500,
                    msg: '保存失败'
                });
            }
            if (res == 200) {
                next(null, {
                    code: 200,
                    msg: '保存成功'
                });
            }
        });
    }
};

handler.addGold = function(msg, session, next){

}

handler.portrait = function (msg, session, next) {
}