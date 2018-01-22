const express = require('express');
const router = express.Router({ caseSensitive: true });
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var User = require('../models/user.js');
var Polls = require('../models/polls.js');




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
                var token = jwt.sign({ data: user }, process.env.secret, { expiresIn: 3600 });
                return res.status(200).send(token);
            }
            return res.status(400).send('Password is not correct');
        });
    }
    else {


        return res.status(400).send('You are not registered');
    }
});


router.post('/verify', function (req, res) {
    var token = req.body.token;

    if (!token) {
        return res.status(400).send('No token has benn provided');
    }
    jwt.verify(token, process.env.secret, function (err, decoded) {
        if (err) {
            return res.status(400).send('Error with token');
        }
        return res.status(200).send(decoded);
    });
});

router.post('/polls', authenticate, function (req, res) {

    var poll = new Polls();
    poll.name = req.body.name;
    poll.options = req.body.options;
    poll.owner = req.body.owner;

    poll.save(function (err, data) {
        if (err) {
            console.log('Save'+err);
            return res.status(400).send(err);
        }
        return res.status(201).send(data);
    })
});

function authenticate(req, res, next) {
    if (!req.headers.authorization) {
        console.log('No token'+err);
        return res.status(400).send('There is no token')
    }
    if (req.headers.authorization.split(' ')[1]) {
        var token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.secret, function (err, decoded) {
            if (err) {
                console.log('verifytoken'+err);
                return res.status(400).send(err);
            }
            next();
        });
    }
}

router.get('/polls', function (req, res) {
    Polls.find({}, function (err, polls) {
        if (err) {
            return res.status(400).send(err);
        }
        if (polls.lenght < 1) {
            return res.status(400).send('There are no polls');
        }
        return res.status(200).json(polls);
    });
});

router.put('/polls/add-option', function (req, res) {

    var id = req.body.id;
    var option = req.body.option;
    Polls.findById(id, function (err, poll) {
        console.log(poll);
        if (err) {
            return res.status(400).send(err);
        }
        for (var i = 0; i < poll.options.length; i++) {
            if (poll.options[i].name === option) {
                return res.status(403).send({ message: 'Option already exists' });
            }
        }
        poll.options.push({
            name: option,
            votes: 0
        });
        poll.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: 'Problem has occurred',
                    error: err
                });
            }
            else {
                return res.status(201).send({
                    message: 'A poll option has been created'
                });
            }
        });
    });
});

router.get('/polls/:id', function (req, res) {
    Polls.findOne({
        _id: req.params.id
    }, function (err, poll) {


        if (err) {
            return res.status(400).send(err);
        } else {
            return res.status(200).send(poll);
        }

    });
});

router.put('/polls', function (req, res) {
    console.log(req.body.vote);
    Polls.findById(req.body.id, function (err, poll) {
        if (err) {
            return res.status(400).send(err);
        }
        console.log(poll + "Prueba");
        for (var i = 0; i < poll.options.length; i++) {
            if (poll.options[i]._id.toString() === req.body.vote) {
                console.log('hit');
                poll.options[i].votes += 1;
                poll.save(function (err, response) {
                    if (err) {
                        return res.status(400).send(err);
                    }
                    else {
                        return res.status(200).send({
                            message: 'You are voted'
                        })
                    }
                });
            }
        }
    });
});

router.get('/user-polls/:name', function (req, res) {
    if (!req.params.name) {
        return res.status(400).send({
            message: 'No user name'
        });
    }
    else {
        Polls.find({ owner: req.params.name }, function (err, doc) {
            if (err) {
                return res.status(400).send(err);
            }
            else {
                return res.status(200).send(doc);
            }
        });
    }
});

router.delete('/polls/:id', function (req, res) {
    Polls.findById(req.params.id, function (err, poll) {
        if (err) {
            return res.status(400).send({
                message: 'No poll with that id'
            });
        }
        if (poll) {
            var token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.secret, function (err, decoded) {
                if (err) {
                    return res.status(401).json('invalid token');
                }
                else {
                    console.log(poll);
                    if (decoded.data.name === poll.owner) {
                        poll.remove(function (err) {
                            if (err) {
                                return res.status(400).send(err);
                            }
                            else {
                                return res.status(200).send({
                                    message: 'Deleted poll'
                                });
                            }
                        });
                    }
                    else {
                        return res.status(403).send({
                            message: 'This are not your poll'
                        })
                    }
                }
            });
        }
    });
});

module.exports = router;