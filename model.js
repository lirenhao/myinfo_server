/**
 * Configuration.
 */
var clients = require('./clients.json')
var config = {
	clients,
	tokens: []
};

/**
 * Dump the memory storage content (for debug).
 */

var dump = function () {
	console.log('clients', config.clients);
	console.log('tokens', config.tokens);
};

/*
 * Methods used by all grant types.
 */

var getAccessToken = function (bearerToken, callback) {

	var tokens = config.tokens.filter(function (token) {

		return token.accessToken === bearerToken;
	});

	return callback(false, tokens[0]);
};

var getClient = function (clientId, clientSecret, callback) {

	var clients = config.clients.filter(function (client) {

		return client.clientId === clientId && client.clientSecret === clientSecret;
	});

	callback(false, clients[0]);
};

var grantTypeAllowed = function (clientId, grantType, callback) {

	var clientsSource,
		clients = [];

	if (grantType === 'client_credentials') {
		clientsSource = config.clients;
	}

	if (!!clientsSource) {
		clients = clientsSource.filter(function (client) {

			return client.clientId === clientId;
		});
	}

	callback(false, clients.length);
};

var saveAccessToken = function (accessToken, clientId, expires, user, callback) {

	config.tokens.push({
		accessToken: accessToken,
		expires: expires,
		clientId: clientId,
		user: user
	});

	callback(false);
};

/*
 * Method used only by client_credentials grant type.
 */

var getUserFromClient = function (clientId, clientSecret, callback) {

	var clients = config.clients.filter(function (client) {

		return client.clientId === clientId && client.clientSecret === clientSecret;
	});

	var user;

	if (clients.length) {
		user = clients[0];
	}

	callback(false, user);
};

/**
 * Export model definition object.
 */

module.exports = {
	getAccessToken: getAccessToken,
	getClient: getClient,
	grantTypeAllowed: grantTypeAllowed,
	saveAccessToken: saveAccessToken,
	getUserFromClient: getUserFromClient
};