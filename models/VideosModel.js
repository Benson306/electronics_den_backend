const mongoose = require('mongoose');

let videosSchema = new mongoose.Schema({
    title: String,
    thumbnail: String,
    price: Number
})


let Videos = mongoose.model('videos', videosSchema);

module.exports = Videos