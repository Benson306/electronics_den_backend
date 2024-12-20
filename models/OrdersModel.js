let mongoose = require('mongoose');

let orderSchema =  new mongoose.Schema({
    first_name: String,
    second_name: String,
    email: String,
    phone_number: String, 
    items : [{}],
    completion_status: String,
    deliveryLocation: String,
    delivery_status: String,
    delivery_cost: Number,
    order_date: String,
    delivery_date: String,
    total_price: Number,
    amount_paid: Number
})

let OrdersModel = mongoose.model('orders', orderSchema);

module.exports = OrdersModel