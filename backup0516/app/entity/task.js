/**
 * Created by WTF on 2016/3/9.
 */

/**
 *用户日常任务
 * @param opts
 * @constructor
 */
var Task = function(opts){
    this.taskId = opts.taskId;
    this.playerId = opts.playerId;
    this.userId = opts.userId;
    this.loginTimes = opts.loginTimes;
    this.playTimes = opts.playTimes;
    this.winTimes =opts.winTimes;
    this.allInTimes = opts.allInTimes;
    this.useHuanpaika = opts.useHuanpaika;
    this.useJinbika = opts.useJinbika;
    this.useFanbeika = opts.useFanbeika;
    this.monthRecharge = opts.monthRecharge;
}

module.exports = Task;