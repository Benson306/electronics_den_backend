let express = require('express');

let app = express.Router();

const bodyParser = require('body-parser');
const Orders = require('../models/OrdersModel');

const urlEncoded = bodyParser.urlencoded({extended: false});

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

function getTodayDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
  const year = today.getFullYear();

  return `${day}/${month}/${year}`;
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
        res.json(response.raw_body);
    });
    
})

//Submit Order Request
app.post('/Checkout', urlEncoded, accessToken, function(req, res){
    let date = getTodayDate();
    let received = {
        OrderTrackingId : "",
        email : req.body.email,
        phone_number : req.body.phoneNumber, 
        items : req.body.products,
        completion_status: "pending",
        deliveryLocation : req.body.location,
        delivery_status : "pending",
        delivery_cost : req.body.deliveryCost,
        order_date : date,
        delivery_date : "",
        total_price : req.body.total
    }

    Order(received).save()
    .then(data => {

        unirest('POST', 'http://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest')
        .headers({
            'Content-Type':'application/json',
            'Accept':'application/json',
            'Authorization':'Bearer ' + req.access_token
        })
        .send({
            "id": data._id, //order id
            "currency": "KES",
            "amount":  1,//data.total_price + data.delivery_cost,
            "description": "Payment for Iko Nini Merch",
            "callback_url": process.env.CLIENT_URL +  "/confirm",
            "cancellation_url": process.env.CLIENT_URL + "/cancel", //Replace with frontend failed Page URL
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

            //Update Order with tracking Id
            Orders.findOneAndUpdate({_id: data._id}, { OrderTrackingId: response.raw_body.order_tracking_id}, {new: false})
            .then( data => {
                res.json(response.raw_body)
            })
            .catch( err => {
                console.log(err)
            })
        })
    })
    .catch(function(err){
        if(err) throw err;
    })
})


//Receives IPN notifcations
app.post('/ipn_callback', accessToken, urlEncoded, function(req, res){
    console.log('ipn callback')

    //Get transaction Status
    unirest('GET', `http://cybqa.pesapal.com/pesapalv3/api/Transactions/GetTransactionStatus?orderTrackingId=${req.body.OrderTrackingId}`)
    .headers({
        "Content-Type" : "application/json",
        "Accept" : "application/json",
        "Authorization": "Bearer " + req.access_token
    })
    .end(response =>{
        if (response.error) throw new Error(response.error);

        let result = JSON.parse(response.raw_body);

        Orders.findOneAndUpdate({OrderTrackingId: req.body.OrderTrackingId}, { completion_status: result.payment_status_description},{ new: false })
        .then( data => {
            console.log(data);
            res.json('success')
        })
        .catch(err =>{
            console.log(err);
        })

    })
    
})


app.get('/ConfirmPayment/:id', urlEncoded, function(req, res){

    //Check if Id is valid mongo Id
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
    {
            res.json('Invalid Id')
    }else{
        Orders.findById(req.params.id)
        .then(data => {
            if(data){ //Check id data has been found

                if(data.completion_status === "Completed"){
                    res.json('Completed')
                }else if(data.completion_status === "Failed"){
                    res.json('Failed')
                }else if(data.completion_status === "pending"){
                    res.json('Pending')
                }

            }else{
                res.json('Order Does Not Exist');
            }
        })
        .catch(err => {
            console.log('error');    
        })
    }
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

        res.json(response.raw_body)
    });
})


//Dashboard Data

//Get Delivered Orders
app.get('/GetAllOrders', function(req, res){
    Orders.find({})
    .then( data =>{ 
        res.json(data);
    })
    .catch(err =>{
        console.log(err);
    })
})

app.get('/GetDeliveredOrders', function(req, res){
    Orders.find({ delivery_status: 'delivered' })
    .then( data =>{ 
        res.json(data);
    })
    .catch(err =>{
        console.log(err);
    })
})


//Get Orders Pending Delivery
app.get('/GetPendingOrders', function(req, res){
    Orders.find({$and:[{ delivery_status: 'pending' },{completion_status: 'Completed'}]})
    .then( data =>{ 
        res.json(data);
    })
    .catch(err =>{
        console.log(err);
    })
})

//Update Orders On Delivery
app.put('/update_delivery/:id', urlEncoded, function(req, res){
    let date = getTodayDate(); 
    Orders.findByIdAndUpdate(req.params.id,{delivery_status:'delivered', delivery_date: date }, {new: true})
    .then(data => {
        res.json('success')
    })
    .catch(err => console.log('error'))
})


module.exports = app;