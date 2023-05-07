let express = require('express');

let app = express();

const bodyParser = require('body-parser');

const urlEncoded = bodyParser.urlencoded({extended: false});

let unirest = require('unirest');

require('dotenv').config();

app.use(express.json())

function access_token(){

    let req = unirest('POST', `https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken`)
    .headers({
        "Content-Type" : "application/json",
        "Accept" : "application/json"
    })
    .send(JSON.stringify({
        "consumer_key": process.env.CONSUMER_KEY,
        "consumer_secret": process.env.CONSUMER_SECRET
    }))
    .end(response => { 
        //if (res.error) throw new Error(res.error); 
        // if (response.error) {console.log(response.error)};
        let result = JSON.parse(response.raw_body);
        console.log(result)
        //res.json(result)
    });
}

access_token();

app.get('/', function(req, res){

    access_token();
    
    res.json(req.body);
})

app.listen(3000)