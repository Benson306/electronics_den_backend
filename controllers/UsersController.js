let express = require('express');

let app = express.Router();

const bodyParser = require('body-parser');

const urlEncoded = bodyParser.urlencoded({extended: false});

const bcrypt = require('bcrypt');
const Users = require('../models/UsersModel');

const saltRounds = 10;

const someOtherPlaintextPassword = 'niniiko';

//Add Userss
app.post('/add_Users', urlEncoded, function(req, res){
    
    const myPlaintextPassword = req.body.password;

    //Check if Users exists
    Users.find({email: req.body.email})
    .then(data =>{
        if(data.length > 0){
            res.json('Exists')
        }else{
                bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
                    // Store hash in your password DB.
                    Users({ email: req.body.email, password: hash}).save()
                    .then( data =>{
                        res.json('Added');
                    })
                    .catch(err =>{
                        res.json('Not Added')
                    })
                });
        }
    })
    .catch(err => console.log(err))

})


//Get Userss
app.get('/Users', function(req, res){
    Users.find()
    .then(data =>{
        res.json(data);    
    })
    .catch(err => console.log(err))
})

//Delete Users
app.delete('/delete/:id', urlEncoded, function(req, res){
    Users.findByIdAndDelete(req.params.id)
    .then(result =>{
        res.json('success');
    })
    .catch( err => console.log(err) )
})


//Login
app.post('/login', urlEncoded, function(req, res){
    Users.findOne({email: req.body.email})
    .then(data =>{
        if(data){
            bcrypt.compare(req.body.password, data.password, function(err, result) {
                if(result){
                    res.json('success')
                }else{
                    res.json('Wrong Credentials')
                }
            })

        }else{
            res.json('Wrong Credentails')
        }
    })
})

module.exports = app