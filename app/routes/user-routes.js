var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var User = require('../models/user');

module.exports = function(app) {

    app.post('/api/autologin', function(req, res) {
        User.findOne({ 'email': req.body.email, 'passwordHash': req.body.passwordHash },
        function(err, user) {
            if (err) {
                console.error(err);
                res.status(500).jsonp({ error: "There was an error with database"});
                return;
            }

            if (!user) {
                console.error("No such email - " + req.body.email);
                res.status(401).jsonp({ error: "Invalid email and/or password" });
            }
            else {
                console.log(new Date().timeNow() + " Authenticating user from autologin: " + user.username);
                res.status(200).jsonp(user);
            }
        });
    });

    app.post('/api/login', function(req, res) {
        console.log(req.body);
        User.findOne({ 'email': req.body.email }, function(err, user) {
            if (err) {
                console.error(err);
                res.status(500).jsonp({ error: "There was an error with database"});
                return;
            }

            if (!user) {
                console.error("No such email - " + req.body.email);
                res.status(401).jsonp({ error: "Invalid email and/or password" });
            }
            else if (bcrypt.compareSync(req.body.password, user.passwordHash)) {
                console.log("Authenticating user: " + user.username);
                res.status(200).jsonp(user);
            }
            else {
                console.error("Incorrect password!");
                res.status(401).jsonp({ error: "Invalid email and/or password" });
            }
        });
    });

    app.post('/api/register', function(req, res) {
        User.find().or([{ 'email': req.body.email }, { 'username': req.body.username }]).
        exec(function(err, users) {
            if (err) {
                console.error(err);
                res.status(500).jsonp({ error: "There was an error with database"});
                return;
            }

            if (users.length === 0) {
                var newUser = new User();
                newUser.username     = req.body.username;
                newUser.email        = req.body.email;
                newUser.passwordHash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync());
                newUser.firstName    = req.body.firstName;
                newUser.lastName     = req.body.lastName;
                newUser.save();
                console.log("Registering a new user - " + newUser.username);
                res.status(200).jsonp(newUser);
            }
            else {
                console.log("Duplicate email/username detected.");
                res.status(403).jsonp({ error: "There is already an account with provided email/username." });
            }
        });
    });
};
