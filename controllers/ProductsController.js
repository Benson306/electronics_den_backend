let express = require('express');

let app = express.Router();

const bodyParser = require('body-parser');

const urlEncoded = bodyParser.urlencoded({extended: false});

const multer = require('multer'); // For handling file uploads

const fs = require('fs'); // For working with the file system

const path = require('path'); // For handling file paths
const ProductsModel = require('../models/ProductsModel');
const verifyToken = require('../middleware/authMiddleware');

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
    ProductsModel.find({})
    .then((data)=>{
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(400).json('error');
    })
})

app.get('/get_products/:type', (req, res)=>{
    ProductsModel.find({$and: [{availability: true},{type: req.params.type}]})
    .then((data)=>{
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(400).json('error');
    })
})

app.post('/add_product', verifyToken, upload.array('image'), (req, res)=>{
    let image = req.files ? req.files.map(file => file.filename) : [];    
    let productName  = req.body.productName;
    let sub_category = req.body.sub_category;
    let type = req.body.type;
    let description = req.body.description;
    let price  = req.body.price;
    let links = req.body.links;

    let data = {
        image, productName, price, availability : true, description, type, links, sub_category
    }

    ProductsModel(data).save()
    .then(()=>{
        res.status(200).json('success');
    })
    .catch(err => {
        res.status(400).json('failed');
    })
})

app.put('/edit_product/:id', upload.array('image'), verifyToken, async (req, res) => {
    const id = req.params.id;
    const productName = req.body.productName;
    const description = req.body.description;
    const type = req.body.type;
    const sub_category = req.body.sub_category;
    const price = req.body.price;
    let links = req.body.links;
  
    const incomingImages = req.body.image
  
    let images = [];
  
    if (Array.isArray(incomingImages)) {
      images = [...images, ...incomingImages]
  
    } else if (typeof incomingImages === 'string') {
      images.push(incomingImages)
    }
  
    let data = {
        sub_category,
        type,
        productName,
        price,
        description,
        links
    };
  
    try {
      const product = await ProductsModel.findById(id);
      
      if (!product) {
        return res.status(404).json('Product not found');
      }
  
      if (req.files && req.files.length > 0) {
        let filenames = req.files.map(file => file.filename);
        data.image = [...images, ...filenames];
      }else{
        data.image = images;
      }
  
      const updatedProduct = await ProductsModel.findByIdAndUpdate(id, data, { new: true });
      res.status(200).json('success');
    } catch (err) {
      console.error(err);
      res.status(500).json('failed');
    }
  });

app.delete('/del_product/:id', urlEncoded, verifyToken, (req, res)=>{
    ProductsModel.findByIdAndRemove(req.params.id)
    .then(()=>{
        res.status(200).json('success');
    })
    .catch(err => {
        res.status(400).json('failed');
    })
})

app.post('/change_availability/:id', urlEncoded, verifyToken, (req, res)=>{
    ProductsModel.findByIdAndUpdate(req.params.id, { availability: req.body.value }, {new: true})
    .then(()=>{
        res.status(200).json('success');
    })
    .catch(err => {
        res.status(400).json('failed');
    })
})


module.exports = app;