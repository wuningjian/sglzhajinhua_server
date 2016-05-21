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
    console.log('cd addGold handler', msg);
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

}

handler.buyHuanPaiKa  = function (msg, session, next){
    var playerId = msg.playerId;
    var huanPaiKa = msg.huanPaiKa;
    if(!!playerId&&!!huanPaiKa){
        playerDao.setHuanPaiKa(playerId,huanPaiKa,function(err,res){
            if(!!err){
                next(null, {
                    code: 500,
                    msg: '购买出错'
                });
            }else{
                next(null, {
                    code: 200,
                    msg: '购买成功'
                });
            }
        })
    }
}

handler.buyFanBeiKa  = function (msg, session, next){
    var playerId = msg.playerId;
    var fanBeiKa = msg.fanBeiKa;
    if(!!playerId&&!!fangBeiKa){
        playerDao.setFanBeiKa(playerId,fangBeiKa,function(err,res){
            if(!!err){
                next(null, {
                    code: 500,
                    msg: '购买出错'
                });
            }else{
                next(null, {
                    code: 200,
                    msg: '购买成功'
                });
            }
        })
    }
}

handler.buyJinBiKa  = function (msg, session, next){
    var playerId = msg.playerId;
    var jinBiKa = msg.jinBiKa;
    if(!!playerId&&!!jinBiKa){
        playerDao.setJinBiKa(playerId,jinBiKa,function(err,res){
            if(!!err){
                next(null, {
                    code: 500,
                    msg: '购买出错'
                });
            }else{
                next(null, {
                    code: 200,
                    msg: '购买成功'
                });
            }
        })
    }
}

handler.buyEquip  = function (msg, session, next){
    var playerId = msg.playerId;
    var equip = msg.equip;
    var number = msg.number;
    if(!!playerId&&!!equip){
        playerDao.setEquip(playerId,equip,number,function(err,res){
            if(!!err){
                next(null, {
                    code: 500,
                    msg: '购买出错'
                });
            }else{
                next(null, {
                    code: 200,
                    msg: '购买成功'
                });
            }
        })
    }else {
        next(null, {
            code: 500,
            msg: '购买参数错误'
        });
    }
}

handler.buyDiamond  = function (msg, session, next){
    var playerId = msg.playerId;
    var number = msg.number;
    if(!!playerId&&!!number){
        playerDao.buyDiamond(playerId,number,function(err,res){
            if(!!err){
                next(null, {
                    code: 500,
                    msg: '购买出错'
                });
            }else{
                next(null, {
                    code: 200,
                    msg: '购买成功'
                });
            }
        })
    }else {
        next(null, {
            code: 500,
            msg: '购买参数错误'
        });
    }
}

handler.buyGift  = function (msg, session, next){
    var playerId = msg.playerId;
    var gift = msg.gift;
    var number = msg.number;
    if(!!playerId&&!!gift&&!!number){
        playerDao.buyGift(playerId,gift,number,function(err,res){
            if(!!err){
                next(null, {
                    code: 500,
                    msg: '购买出错'
                });
            }else{
                next(null, {
                    code: 200,
                    msg: '购买成功'
                });
            }
        })
    }else {
        next(null, {
            code: 500,
            msg: '购买参数错误'
        });
    }
}

handler.getStoreData = function(msg,session,next){
    playerDao.getStore(function(err,res){
        if(!!res){
            next(null,{code:200,store:res});
        }
    });
}

handler.getStoreItem = function (msg,session,next) {
    var itemId = msg.itemId;
    if (!!itemId) {
        playerDao.getStoreItem(itemId,function(err,storeItem){
            if (!!err){
                console.log(err);
                next(null,{code:500,msg:'getStoreItem err'});
            } else {
                next(null,{code:200,storeItem:storeItem});
            }
        });
    } else {
        next(null,{code:500,msg:'args err'});
    }
}

handler.buy = function(msg,session,next){
    console.log('msg: '+msg);
    var playerId = msg.playerId;
    var tag = msg.tag;
    console.log(playerId,tag);
    if(!!playerId&&!!tag){
        playerDao.storeBuy(playerId,tag,function(err,player){
            if(!!err){
                console.log('出错！！！');
                console.log(err);
                next(null,{code:500,msg:'buy 错误'});
            }else{
                console.log(player);
                var p = player;
                next(null,{code:200,msg:'购买成功',player:p});
            }
        });
    }else{
        console.log('参数错误');
        next(null,{code:500,msg:'param err'});
    }
}