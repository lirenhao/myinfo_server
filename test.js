const express = require('express')
const fetch = require('node-fetch')
const jwt = require('jsonwebtoken')

const app = express()

const client = {
    clientId: 'application1',
    clientSecret: 'secret1'
}

app.get('/', (req, res) => {
    fetch('http://localhost:3001/oauth/token', {
            method: 'POST',
            body: 'grant_type=client_credentials',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic YXBwbGljYXRpb24xOnNlY3JldDE='
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            res.redirect(`http://localhost:3001?access_token=${data.access_token}&templateId=temp1&state=1234567890`)
        })
})

app.get('/callback', (req, res) => {
    const token = req.query.data
    res.send(jwt.verify(token, client.clientSecret))
})

app.listen(3000);