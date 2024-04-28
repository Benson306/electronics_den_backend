let express = require('express');

let app = express.Router();

const bodyParser = require('body-parser');

const urlEncoded = bodyParser.urlencoded({extended: false});

const multer = require('multer'); // For handling file uploads

const fs = require('fs'); // For working with the file system

const path = require('path'); // For handling file paths
const Videos = require('../models/VideosModel');

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, './uploads');
    },
    filename: (req, file, cb)=>{
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage })

app.post('/add_video', upload.single('thumbnail'), (req, res)=>{
    let thumbnail = req.file.filename;
    let hours = req.body.hours;
    let minutes = req.body.minutes;
    let title = req.body.title;
    let price = req.body.price;

    Videos({ thumbnail, title, hours, minutes, price }).save()
    .then((response)=>{
        res.status(200).json('success');
    })
    .catch(err => {
        res.status(400).json('success');
    })
})

app.get('/get_videos', (req, res)=>{
    Videos.find({})
    .then((response)=>{
        res.json(response);
    })
    .catch(()=>{
        res.status(400).json('failed');
    })
})

app.delete('/del_video/:id', (req, res)=>{
    Videos.findByIdAndRemove(req.params.id)
    .then(()=>{
        res.status(200).json('success');
    })
    .catch(()=>{
        res.status(400).json('success');
    })
})

module.exports = app;