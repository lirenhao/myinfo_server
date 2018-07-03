const express = require('express')
const bodyParser = require('body-parser')
const oauthserver = require('oauth2-server')
const myInfoApi = require('./api')

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.oauth = oauthserver({
    model: require('./model'),
    grants: ['password', 'client_credentials'],
    debug: true
});

app.all('/oauth/token', app.oauth.grant());

app.get('/', app.oauth.authorise(), (req, res) => {
    const purpose = 'demonstrating MyInfo APIs'
    const state = 123
    console.log(req.oauth.user)
    res.redirect(myInfoApi.getAuthoriseUrl(state, purpose))
});

app.get('/callback', (req, res) => {
    const data = req.query
    myInfoApi.getTokenApi(data.code)
        .then(token => myInfoApi.getPersonApi(token.access_token))
        .then(person => {
            // TODO 错误码的返回
            res.send(person)
        })
        .catch(e => {
            // TODO 错误码的返回
            console.log(e.message)
            res.send(e)
        })
});

app.use(app.oauth.errorHandler());

app.listen(3001);