/**
 * Created by WTF on 2016/2/25.
 *
 * 用户实体类--主要登录验证相关
 */

var User = function(opts){
    this.userId = opts.userId;
    this.userName = opts.userName;
    this.password = opts.password;
    this.loginCount = opts.loginCount;
    this.lastLoginTime = opts.lastLoginTime;
    this.imei = opts.imei;
};

module.exports = User;