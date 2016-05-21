var gameDao = require('../../../dao/gameDao');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
		this.app = app;
};

var handler = Handler.prototype;

/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function(msg, session, next) {
	var self = this;
	gameDao.returnRoom(function(res){

		console.log("cb res"+res);

		var rid = res.toString();

		var uid = msg.username + '*' + rid;
		//var uid = msg.username;
		var sessionService = self.app.get('sessionService');
		//duplicate log in
		if( !! sessionService.getByUid(uid)) {
			next(null, {
				code: 500,
				error: true
			});
			return;
		}
		session.bind(uid);
		session.set('rid', rid);
		session.push('rid', function(err) {
			if(err) {
				console.error('set rid for session service failed! error is : %j', err.stack);
			}
		});

		session.set('readyNum',0);
		session.push('readyNum',function(err){
			if(err){
				console.error('enterHandler:set readyNum for session service failed! error is : %j', err.stack);
			}
		});

		session.on('closed', onUserLeave.bind(null, self.app));
		self.app.rpc.game.gameRemote.add(session, uid, self.app.get('serverId'), rid, true, function(location){
			next(null, {
				//users:users,
				//rid:rid
				location:location
			});
			//gameDao.getRoomInfo(rid,function(res){
			//	next(null, {
			//		//users:users,
			//		//rid:rid
			//		location:location,
			//		roomInfo:res
			//	});
			//});

		});
	});
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
	if(!session || !session.uid) {
		return;
	}
	//app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
	app.rpc.game.gameRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
};