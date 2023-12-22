let express = require('express');

let app = express.Router();

const bodyParser = require('body-parser');

const urlEncoded = bodyParser.urlencoded({extended: false});

const multer = require('multer'); // For handling file uploads

const fs = require('fs'); // For working with the file system

const path = require('path'); // For handling file paths
const Products = require('../models/ProductsModel');

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, './uploads');
    },
    filename: (req, file, cb)=>{
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage })

app.get('/get_products', (req, res)=>{
    Products.find({})
    .then((data)=>{
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(400).json('error');
    })
})

app.get('/get_products/:type', (req, res)=>{
    Products.find({$and: [{availability: true},{type: req.params.type}]})
    .then((data)=>{
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(400).json('error');
    })
})

app.post('/add_product', upload.single('image'), (req, res)=>{
    let image = req.file.filename;
    let productName  = req.body.productName;
    let type = req.body.type;
    let price  = req.body.price;
    let xSmall = req.body.xSmall;
    let small = req.body.small
    let medium = req.body.medium
    let large = req.body.large
    let xLarge = req.body.xLarge
    let xXLarge = req.body.xXLarge

    let data = {
        image, type, productName, price, xSmall, small, medium, large,
        xLarge, xXLarge
    }

    Products(data).save()
    .then(()=>{
        res.status(200).json('success');
    })
    .catch(err => {
        res.status(400).json('failed');
    })
})

app.delete('/del_product/:id', urlEncoded, (req, res)=>{
    Products.findByIdAndRemove(req.params.id)
    .then(()=>{
        res.status(200).json('success');
    })
    .catch(err => {
        res.status(400).json('failed');
    })
})

app.post('/change_availability/:id', urlEncoded, (req, res)=>{
    Products.findByIdAndUpdate(req.params.id, { availability: req.body.value }, {new: true})
    .then(()=>{
        res.status(200).json('success');
    })
    .catch(err => {
        res.status(400).json('failed');
    })
})


module.exports = app;