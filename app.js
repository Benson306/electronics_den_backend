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

//Register IPN callback URL
app.get('/RegisterIpn', accessToken, function(req, res){

    unirest('POST', 'http://cybqa.pesapal.com/pesapalv3/api/URLSetup/RegisterIPN/')
    .headers({
        "Content-Type" : "application/json",
        "Accept" : "application/json",
        "Authorization": "Bearer " + req.access_token
    })
    .send({
        "url" : process.env.SERVER_URL +  "/ipn_callback",
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

let mongoose = require('mongoose');

let mongoURI = process.env.Mongo_URI;

mongoose.connect(mongoURI);

let orderSchema =  new mongoose.Schema({
    OrderTrackingId : String,
    email: String,
    phone_number: String, 
    items : [{}],
    completion_status: String,
    deliveryLocation: String,
    delivery_status: String,
    delivery_cost: Number,
    order_date: String,
    delivery_date: String,
    total_price: Number
})

let Order = mongoose.model('orders', orderSchema);

//Submit Order Request
app.post('/Checkout', urlEncoded, accessToken, function(req, res){

    Order(req.body).save()
    .then(function(data){
        //res.json(data);

        unirest('POST', 'http://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest')
        .headers({
            'Content-Type':'application/json',
            'Accept':'application/json',
            'Authorization':'Bearer ' + req.access_token
        })
        .send({
            "id": data._id, //order id
            "currency": "KES",
            "amount": data.total_price,
            "description": "Payment for Iko Nini Merch",
            "callback_url": process.env.SERVER_URL +  "/SuccessPaymentCallback",
            "cancellation_url": process.env.SERVER_URL + "/FailedPaymentCallback", //Replace with frontend failed Page URL
            "redirect_mode": "",
            "notification_id": process.env.IPN_ID,
            "branch": "Iko Nini - Nairobi",
            "billing_address": {
                "email_address": data.email,
                "phone_number": data.phone_number,
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
    .catch(function(err){
        if(err) throw err;
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



port = process.env.PORT || 3000;
app.listen(port);