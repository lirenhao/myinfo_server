const express = require('express')
const bodyParser = require('body-parser')
const oauthServer = require('oauth2-server')
const jwt = require('jsonwebtoken')
const myInfoApi = require('./api')
const clients = require('./clients.json')

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.oauth = oauthServer({
    model: require('./model'),
    grants: ['client_credentials'],
    debug: true
});

app.all('/oauth/token', app.oauth.grant());

app.get('/', app.oauth.authorise(), (req, res) => {
    const user = req.user
    res.redirect(myInfoApi.getAuthoriseUrl(user.clientId, user.purpose))
});

app.get('/callback', (req, res) => {
    const data = req.query
    const users = clients.filter(item => item.clientId === data.state)
    if (!users.length) {
        res.send({
            status: "ERROR",
            msg: "NO CLIENT INFORMATION"
        })
    } else {
        const user = users[0]
        myInfoApi.getTokenApi(data.code)
            .then(token => myInfoApi.getPersonApi(token.access_token))
            .then(message => {
                // TODO 错误码的返回
                res.redirect(`${user.redirectUrl}?data=${jwt.sign(message, user.clientSecret)}`)
            })
            .catch(e => {
                // TODO 错误码的返回
                res.redirect(`${user.redirectUrl}?data=${jwt.sign(e, user.clientSecret)}`)
            })
    }
});

app.use(app.oauth.errorHandler());

app.listen(3001);