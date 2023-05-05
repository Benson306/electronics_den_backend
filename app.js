const express = require('express');

const app = express();

app.get('/', function(req, res){
    res.send('Home');
})

app.listen(3000)