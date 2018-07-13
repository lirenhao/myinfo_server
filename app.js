const express = require('express');
const bodyParser = require('body-parser');
const oauthServer = require('oauth2-server');
const jwt = require('jsonwebtoken');
const myInfoApi = require('./api');
const clients = require('./clients.json');
const template = require('./template.json');
const oauthConfig = require('config').get('oauth');

const app = express();

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(bodyParser.json());

app.oauth = oauthServer({
    model: require('./model'),
    grants: ['client_credentials'],
    accessTokenLifetime: oauthConfig.expire,
});

app.all('/oauth/token', app.oauth.grant());

app.get('/', app.oauth.authorise(), (req, res) => {
    // 回调增加state
    const user = req.user;
    const state = jwt.sign({
            clientId: user.clientId,
            templateId: req.query.templateId,
            state: req.query.state
        },
        oauthConfig.stateSecret
    );
    const attributes = template[req.query.templateId];
    res.redirect(myInfoApi.getAuthoriseUrl(state, user.purpose, attributes));
});

app.get('/callback', (req, res) => {
    const data = req.query;
    const state = jwt.verify(data.state, oauthConfig.stateSecret);
    const users = clients.filter(item => item.clientId === state.clientId);
    const attributes = template[state.templateId];
    if (!users.length) {
        res.send({
            status: 'ERROR',
            msg: 'NO CLIENT INFORMATION',
        });
    } else {
        const user = users[0];
        myInfoApi
            .getTokenApi(data.code)
            .then(token => myInfoApi.getPersonApi(token.access_token, attributes))
            .then(data => {
                // Myinfo平台接口记录来源系统、使用目的、客户NRIC/FIN, 提取数据的栏位名、提取时间
                console.log(
                    `Client:${user.clientId}\nPurpose:${user.purpose}\nNRIC:${data.msg.uinfin}\nAttributes:${attributes}`
                );
                res.redirect(
                    `${user.redirectUrl}?state=${state.state}&data=${jwt.sign (data, user.clientSecret)}`
                );
            })
            .catch(e => {
                res.redirect(
                    `${user.redirectUrl}?state=${state.state}&data=${jwt.sign (e, user.clientSecret)}`
                );
            });
    }
});

app.use(app.oauth.errorHandler());

app.listen(3001);