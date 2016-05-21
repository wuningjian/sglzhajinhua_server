/**
 * Created by wuningjian on 5/5/16.
 */
module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
};

Handler.prototype.payMsg = function(msg,session,next){
    console.log("payInfo"+msg);
    next(null,{
        result:"update successful"
    });
};