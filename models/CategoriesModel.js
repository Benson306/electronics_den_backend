const mongoose = require('mongoose');

let categorySchema = new mongoose.Schema({
    category: String,
    sub_categories: [String]
})

let CategoriesModel = mongoose.model('categories', categorySchema);

module.exports = CategoriesModel