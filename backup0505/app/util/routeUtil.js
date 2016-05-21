var exp = module.exports;
var dispatcher = require('./dispatcher');

exp.chat = function(session, msg, app, cb) {
	var chatServers = app.getServersByType('chat');

	if(!chatServers || chatServers.length === 0) {
		cb(new Error('can not find chat servers.'));
		return;
	}

	var res = chatServers[0];//dispatcher.dispatch(session.get('rid'), chatServers);

	cb(null, res.id);
};

exp.game = function(session, msg, app, cb) {
	var gameServers = app.getServersByType('game');

	if(!gameServers || gameServers.length === 0) {
		cb(new Error('can not find game servers.'));
		return;
	}

	var res = gameServers[0];//dispatcher.dispatch(session.get('rid'), gameServers);

	cb(null, res.id);
};

exp.user = function(session, msg, app, cb){
    var userServers = app.getServersByType('user');

    if(!userServers || userServers.length === 0) {
        cb(new Error('can not find user Servers.'));
        return;
    }

    var res = userServers[0];//dispatcher.dispatch(session.get('rid'), userServers);

    cb(null, res.id);
};

exp.broadcast = function(session, msg, app, cb){
	var broadcastServers = app.getServersByType('broadcast');

	if(!broadcastServers || broadcastServers.length === 0) {
		cb(new Error('can not find broadcast Servers.'));
		return;
	}

	var res = broadcastServers[0];//dispatcher.dispatch(session.get('rid'), userServers);

	cb(null, res.id);
};

exp.sign = function(session, msg, app, cb){
	var signServers = app.getServersByType('sign');

	if(!signServers || signServers.length === 0) {
		cb(new Error('can not find sign Servers.'));
		return;
	}

	var res = signServers[0];//dispatcher.dispatch(session.get('rid'), userServers);

	cb(null, res.id);
};

exp.payInfo = function(session, msg, app, cb){
	var payInfoServers = app.getServersByType('payInfo');

	if(!payInfoServers || payInfoServers.length === 0) {
		cb(new Error('can not find payInfo Servers.'));
		return;
	}

	var res = payInfoServers[0];//dispatcher.dispatch(session.get('rid'), userServers);

	cb(null, res.id);
};