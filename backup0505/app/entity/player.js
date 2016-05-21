/**
 * Created by WTF on 2016/2/26.
 */

/**
 *
 * @param opts
 * @constructor
 */

var Player = function(opts){
    this.playerId = opts.playerId;      //玩家id  角色id
    this.userId = opts.userId;          //用户id
    this.userName = opts.userName;
    this.password = opts.password;
    this.nickName = opts.nickName;
    this.gender = opts.gender;          //性别
    this.createTime = opts.createTime;  //
    this.signature = opts.signature;    //签名
    this.level = opts.level;            //等级
    this.vip = opts.vip;                //vip等级
    this.gold = opts.gold;              //
    this.diamond = opts.diamond;        //
    this.playTimes = opts.playTimes;    //
    this.winTimes = opts.winTimes;      //
    this.loseTimes = opts.loseTimes;    //
    this.jinBiKa = opts.jinBiKa;        //
    this.huanPaiKa = opts.huanPaiKa;  //
    this.fanBeiKa = opts.fanBeiKa;    //
    this.continueLoginDays = opts.continueLoginDays;  //连续在线天数
    this.portrait = opts.portrait;      //头像--标识方式待定
};

module.exports = Player;