var express = require('express')
var fetch = require('node-fetch')

var app = express()

app.get('/', (req, res) => {
    fetch('http://confidentialApplication:topSecret@localhost:3001/oauth/token', {
        method: 'POST', 
        body: 'grant_type=client_credentials',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }
    })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            res.redirect(`http://localhost:3001?access_token=${data.access_token}`)
        })
})

app.get('/callback', (req, res) => {
    const data = req.query
    res.send(data)
})

app.listen(3000);