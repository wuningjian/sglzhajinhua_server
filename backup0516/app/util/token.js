var crypto = require('crypto');
var parse;
/**
 * Create token by uid. Encrypt uid and timestamp to get a token.
 * 
 * @param  {String} uid user id
 * @param  {String|Number} timestamp
 * @param  {String} pwd encrypt password
 * @return {String}     token string
 */
module.exports.create = function(userId, timestamp, pwd) {
    console.log('create token uid ',userId);
	var msg = userId + '|' + timestamp;
	var cipher = crypto.createCipher('aes-256-cbc', pwd);
	var enc = cipher.update(msg, 'utf8', 'hex');
	enc += cipher.final('hex');
    console.log('token.js token -> ',enc);

    decry(enc);

	return enc;
};

function decry(token){

    var res =parse(token,"secret");
    console.log(res);
}

/**
 * Parse token to validate it and get the uid and timestamp.
 * 
 * @param  {String} token token string
 * @param  {String} pwd   decrypt password
 * @return {Object}  uid and timestamp that exported from token. null for illegal token.     
 */
module.exports.parse = parse =function(token, pwd) {
	var decipher = crypto.createDecipher('aes-256-cbc', pwd);
	var dec;
	try {
		dec = decipher.update(token, 'hex', 'utf8');
		dec += decipher.final('utf8');
	} catch(err) {
		console.error('[token] fail to decrypt token. %j', token);
		return null;
	}
	var ts = dec.split('|');
	if(ts.length !== 2) {
		// illegal token
		return null;
	}
    console.log('解码userid --- '+ts[0]+' '+ts,'timestamp '+ts[1]);
	return {userId: ts[0], timestamp: Number(ts[1])};
};
