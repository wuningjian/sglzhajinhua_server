var dispatcher = require('../../../util/dispatcher');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * Gate handler that dispatch user to connectors.
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param {Function} next next stemp callback
 *
 */
handler.queryEntry = function(msg, session, next) {
	var uid = msg.uid;
	//if(!uid) {
	//	next(null, {
	//		code: 500
	//	});
	//	return;
	//}
	// get all connectors

	var connectors = this.app.getServersByType('connector');

	//var connectors = this.app.getServersByType('game');
	if(!connectors || connectors.length === 0) {
		next(null, {
			code: 500,
			msg:'get no host port'
		});
		return;
	}
	// select connector
	var res = connectors[0];//dispatcher.dispatch(uid, connectors); // select a connector from all the connectors
	// do something with res
	next(null, {
		code: 200,
		host: res.host,
		port: res.clientPort
	});
};
