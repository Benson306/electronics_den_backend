let express = require('express');

let app = express();

const bodyParser = require('body-parser');

const urlEncoded = bodyParser.urlencoded({extended: false});

require('dotenv').config();

app.use(express.json())

let cors = require('cors');

app.use(cors());

const unirest = require('unirest');

function accessToken(req, res, next){

    unirest('POST', 'http://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken/')
    .headers({
        "Content-Type" : "application/json",
        "Accept" : "application/json"
    })
    .send({
        "consumer_key" : process.env.CONSUMER_KEY,
        "consumer_secret" : process.env.CONSUMER_SECRET
    })
    .end(response => {
        if (response.error) throw new Error(response.error);

        let token = response.raw_body.token

        req.access_token = token;

        next();
    });
}

app.get('/', accessToken, function(req, res){

    let token = req.access_token;

    res.json(token);
})

//Register IPN callback URL
app.get('/RegisterIpn', accessToken, function(req, res){

    unirest('POST', 'http://cybqa.pesapal.com/pesapalv3/api/URLSetup/RegisterIPN/')
    .headers({
        "Content-Type" : "application/json",
        "Accept" : "application/json",
        "Authorization": "Bearer " + req.access_token
    })
    .send({
        "url" : "https://f2db-102-212-236-141.ngrok-free.app/ipn_callback",
        "ipn_notification_type" : "POST"
    })
    .end(response => {
        if (response.error) throw new Error(response.error);

        console.log(response.raw_body);
    });

    res.json('success')
})

//Receives IPN notifcations
app.post('/ipn_callback', urlEncoded, function(req, res){
    console.log(req.body);
    req.json('success')
})


//Get registered IPNs for Particular Merchant
app.get('/RegisteredIpns', accessToken, function(req, res){
    unirest('GET', 'http://cybqa.pesapal.com/pesapalv3/api/URLSetup/GetIpnList')
    .headers({
        "Content-Type" : "application/json",
        "Accept" : "application/json",
        "Authorization": "Bearer " + req.access_token
    })
    .end(response => {
        if (response.error) throw new Error(response.error);

        console.log(response.raw_body);

        res.json(response.raw_body)
    });
})


app.listen(3000)