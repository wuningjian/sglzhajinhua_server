var tokenService = require('../../../util/token');
var userDao      = require('../../../dao/userDao');
var Code         = require('../../../consts/code');

var DEFAULT_SECRET = 'secret';
var DEFAULT_EXPIRE = 6 * 60 * 60 * 1000;	// default session expire time: 6 hours

module.exports = function (app) {
    return new Remote(app);
};

var Remote = function (app) {
    this.app    = app;
    var session = app.get('session') || {};
    this.secret =  DEFAULT_SECRET;
    this.expire =  DEFAULT_EXPIRE;
};

var remote = Remote.prototype;

/**
 * Auth token and check whether expire.
 *
 * @param  {String}   token token string
 * @param  {Function} cb
 * @return {Void}
 */
remote.auth = function (token, cb) {
    //token由uid Date.now() 加密密码  加密而成
    //解析token得出uid 和Date.now()  res包含uid和timestamp {uid: ts[0], timestamp: Number(ts[1])}
    console.log(this.toString(),'传入token  '+token);
    var res = tokenService.parse(token, DEFAULT_SECRET);
    if (!res) {
        console.log("非法的token");
        cb(null, Code.ENTRY.FA_TOKEN_ILLEGAL);
        return;
    }

    console.log('auth res ==',JSON.stringify(res));

    //验证token是否在6小时内生成
    if (!checkExpire(res, this.expire)) {
        console.log("token过期");
        cb(null, Code.ENTRY.FA_TOKEN_EXPIRE);
        return;
    }

    console.log('authRemote 解密出userid',res.userId);
    userDao.getUserById(res.userId, function (err, user) {
        if (err) {
            console.log(err);
            console.log('auth getuserbyid err');
            cb(err);
            return;
        }
        //cb = function(err，code, user, cb)
        cb(null, Code.OK, user);
    });
};

/**
 * Check the token whether expire.
 *
 * @param  {Object} token  token info
 * @param  {Number} expire expire time
 * @return {Boolean}        true for not expire and false for expire
 */
var checkExpire = function (token, expire) {
    if (expire < 0) {
        // negative expire means never expire
        return true;
    }

    return (Date.now() - token.timestamp) < expire;
};
