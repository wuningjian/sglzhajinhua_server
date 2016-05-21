/**
 * Created by WTF Wei on 2016/3/25.
 * Function :
 */
module.exports = function (app) {
    return new Handler(app);
}

var Handler = function (app) {
    this.app = app;
}

var handler = Handler.prototype;