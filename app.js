let express = require('express');

let app = express();

require('dotenv').config();

app.use(express.json())

let cors = require('cors');

app.use(cors());

const unirest = require('unirest');

let mongoose = require('mongoose');

let mongoURI = process.env.Mongo_URI;

mongoose.connect(mongoURI);

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let UsersController = require('./controllers/UsersController');
app.use('/', UsersController);

let ProductsController = require('./controllers/ProductsController');
app.use('/', ProductsController);

let OrdersController = require('./controllers/OrdersController');
app.use('/', OrdersController);

let VideosController = require('./controllers/VideosController');
app.use('/', VideosController);

port = process.env.PORT || 5000;
app.listen(port);