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

app.listen(3000)