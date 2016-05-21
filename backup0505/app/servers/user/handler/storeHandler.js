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

handler.addGold = function (msg, session, next) {
    console.log('cd addGold', 'ok');
    var playerId = msg.playerId || 0;
    var gold     = msg.gold || 0;
    var diamond  = msg.diamond || 0;
    var flag     = msg.flag || 'aacc'; //任务 充值 签到
    console.log('gold', msg.playerId + ' ' + gold + ' ' + diamond + ' ' + flag);

    if (!!playerId) {
        console.log('playerId======', playerId);
        playerDao.addGold(msg.playerId, gold, diamond, function (err, GAD) {
            console.log('cd playerDao.addGold cb', 'ok');
            console.log(GAD);
            if (err) {
                next(null, {
                    code: 500,
                    msg: '购买金币错误',
                    gold: 0,
                    diamond: 0
                });
            } else {
                if (!GAD) {
                    next(null, {
                        code: 500,
                        gold: GAD.gold | 0,
                        diamond: GAD.diamond | 0
                    });
                }
                if (!!GAD) {
                    next(null, {
                        code: 200,
                        gold: GAD.gold | 0,
                        diamond: GAD.diamond | 0
                    });
                }
            }
        });
    }

};