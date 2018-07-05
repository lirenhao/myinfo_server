const jwt = require('jsonwebtoken')
const clientsSource = require('./clients.json')
const oauthConfig = require('config').get('oauth')

const getClientById = function (clientId) {

	const clients = clientsSource.filter(function (client) {

		return client.clientId === clientId
	})

	return clients.length ? clients[0] : null;
}

const getClientByIdAndSecret = function (clientId, clientSecret) {

	const clients = clientsSource.filter(function (client) {

		return client.clientId === clientId && client.clientSecret === clientSecret
	})

	return clients.length ? clients[0] : null;
}

/**
 * Dump the memory storage content (for debug).
 */
const dump = function () {
	console.log('clients', clients)
}

/**
 * 生成token
 */
const generateToken = function (type, req, callback) {

	const expires = new Date()
	expires.setSeconds(expires.getSeconds() + oauthConfig.expire)

	const token = {
		id: req.user.clientId,
		exp: expires.getTime()
	}

	jwt.sign(token, oauthConfig.tokenSecret, function (err, encoded) {

		if (err) {
			return callback(err, false)
		}

		return callback(false, encoded)
	})
}

/*
 * 获取token
 */
const getAccessToken = function (bearerToken, callback) {

	jwt.verify(bearerToken, oauthConfig.tokenSecret, function (err, decoded) {

		if (err) {
			return callback(err, false)
		}

		const expires = new Date()
		expires.setTime(decoded.exp)

		return callback(false, {
			id: decoded.id,
			expires
		})
	})
}

/*
 * 保存token
 * 做了jwt签名本地不需要保存token信息
 */
const saveAccessToken = function (accessToken, clientId, expires, user, callback) {

	callback(false)
}

const grantTypeAllowed = function (clientId, grantType, callback) {

	if (grantType === 'client_credentials') {

		callback(false, getClientById(clientId))
	} else {

		callback(true)
	}
}

/**
 * 获取client信息
 */
const getClient = function (clientId, clientSecret, callback) {

	callback(false, getClientByIdAndSecret(clientId, clientSecret))
}

/**
 * 获取user信息从client
 */
const getUserFromClient = function (clientId, clientSecret, callback) {

	callback(false, getClientByIdAndSecret(clientId, clientSecret))
}

module.exports = {
	generateToken: generateToken,
	getAccessToken: getAccessToken,
	saveAccessToken: saveAccessToken,
	grantTypeAllowed: grantTypeAllowed,
	getClient: getClient,
	getUserFromClient: getUserFromClient
}