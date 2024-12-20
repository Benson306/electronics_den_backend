let express = require('express');

let app = express();

require('dotenv').config();

app.use(express.json())

let cors = require('cors');

app.use(cors());

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

let LocationsController = require('./controllers/LocationsController');
app.use('/', LocationsController);

let CategoriesController = require('./controllers/CategoriesController');
app.use('/', CategoriesController);

app.get('/',(req, res)=>{
    res.json('Electronics Den');
})

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

let port = process.env.PORT || 8000;

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
});