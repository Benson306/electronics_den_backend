let express = require('express');

let app = express.Router();

let mongoose = require('mongoose');

const bodyParser = require('body-parser');
const LocationsModel = require('../models/LocationsModel');

const urlEncoded = bodyParser.urlencoded({extended: false});

app.post('/add_location', urlEncoded, (req, res)=>{
    let town = req.body.town;
    let price = req.body.price;

    LocationsModel({ town, price}).save()
    .then(()=>{
        res.json("Success");
    })
    .catch(error => {
        res.status(500).json("Server error");
    })
})

app.get('/get_locations', (req, res)=>{
    LocationsModel.find()
    .then(data => {
        res.json(data);
    })
    .catch(error => {
        res.status(500).json("Server error");
    })
})

module.exports = app;