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
app.post('/ipn_callback', accessToken, urlEncoded, function(req, res){
    console.log('---------------------Notification Callback ---------------------')

    console.log(req.body);

    //Get transaction Status
    unirest('GET', `http://cybqa.pesapal.com/pesapalv3/api/Transactions/GetTransactionStatus?orderTrackingId=${req.body.OrderTrackingId}`)
    .headers({
        "Content-Type" : "application/json",
        "Accept" : "application/json",
        "Authorization": "Bearer " + req.access_token
    })
    .end(response =>{
        if (response.error) throw new Error(response.error);

        console.log('--------------------- Transaction Status ---------------------')
        console.log(response.raw_body);
    })
    //console.log(req.body);
    res.json('success')
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


//Submit Order Request
app.post('/Checkout', urlEncoded, accessToken, function(req, res){

    unirest('POST', 'http://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest')
    .headers({
        'Content-Type':'application/json',
        'Accept':'application/json',
        'Authorization':'Bearer ' + req.access_token
    })
    .send({
        "id": "Anklgklgndkzkjzkkkk", //order id
        "currency": "KES",
        "amount": 1.00,
        "description": "Payment for Iko Nini Merch",
        "callback_url": "https://f2db-102-212-236-141.ngrok-free.app/SuccessPaymentCallback",
        "cancellation_url": "https://f2db-102-212-236-141.ngrok-free.app/FailedPaymentCallback", //Replace with frontend failed Page URL
        "redirect_mode": "",
        "notification_id": "3dd10acf-a7ce-4543-923d-deb09bd2af93",
        "branch": "Iko Nini - Nairobi",
        "billing_address": {
            "email_address": "bnkimtai@gmail.com",
            "phone_number": "0707357072",
            "country_code": "KE",
            "first_name": "Ben",
            "middle_name": "",
            "last_name": "Ndiwa",
            "line_1": "Ndiwa",
            "line_2": "",
            "city": "",
            "state": "",
            "postal_code": "",
            "zip_code": ""
        }
    })
    .end(response =>{
        if (response.error) throw new Error(response.error);

        console.log(response.raw_body);

        res.json(response.raw_body)
    })

})


//Receive Successful Payment Callbacks
app.get('/SuccessPaymentCallback', function(req, res){
    console.log('---------------------Succesful Payment Callback ---------------------')
    console.log(req.body);

    res.json('success');
})

app.get('/FailedPaymentCallback', function(req, res){
    console.log('---------------------Failed Payment Callback ---------------------')
    console.log(req.body);

    res.json('Failed');
})




app.listen(3000)