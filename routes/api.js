const express = require('express');
const router = express.Router({ caseSensitive: true });
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var User = require('../models/user.js');





router.post('/register', function (req, res) {
    if (req.body && req.body.password) {
        var user = new User();
        user.name = req.body.name;
        console.time('bcryptHashing');
        user.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
        console.timeEnd('bcryptHashing');
        user.save(function (err, doc) {
            if (err) {
                return res.status(400).send(err);



            }
            else {
                var token = jwt.sign({
                    data: doc
                }, process.env.secret, { expiresIn: 3600 });
                return res.status(201).send(token);
            }
        })
    }
    else {


        return res.status(400).send({
            message: 'Invalid credentials supplied'
        });
    }
});


router.post('/login', function (req, res) {
    if (req.body.name && req.body.password) {
        User.findOne({ name: req.body.name }, function (err, user) {
            if (err) {
                return res.status(400).send('An error has occurred');
            }
            if (!user) {
                return res.status(404).send('You no are not registered');
            }
            if (bcrypt.compareSync(req.body.password, user.password)) {
               var token=jwt.sign({data:user},process.env.secret,{expiresIn:3600});
                return res.status(200).send(token);
            }
            return res.status(400).send('Password is not correct');
        });
    }
    else {


        return res.status(400).send('You are not registered');
    }
});


router.post('/verify',function(req,res){
var token=req.body.token;

    if(!token){
return res.status(400).send('No token has benn provided');
}
jwt.verify(token,process.env.secret,function(err,decoded){
    if(err){
        return res.status(400).send('Error with token');
    }
    return res.status(200).send(decoded);
});
});

module.exports = router;