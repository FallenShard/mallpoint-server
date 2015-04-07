// routes/routes.js

// grab the model
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var User = require('./models/user');

module.exports = function(app) {

    app.post('/api/autologin', function(req, res) {
        User.findOne({'email': req.body.email, 'passwordHash': req.body.passwordHash},
        function(err, user) {
            if (err) {
                console.error(err);
                return;
            }

            if (!user) {
                console.error("No such email - " + req.body.email);
                res.status(401).jsonp({ error: "Invalid email and/or password" });
            }
            else {
                console.log("Authenticating user: " + user.username);
                res.jsonp(user);
            }
        });
    });

    app.post('/api/login', function(req, res) {
        User.findOne({'email': req.body.email}, function(err, user) {
            if (err) {
                console.error(err);
                return;
            }

            if (!user) {
                console.error("No such email - " + req.body.email);
                res.status(401).jsonp({ error: "Invalid email and/or password" });
            }
            else if (bcrypt.compareSync(req.body.password, user.passwordHash)) {
                console.log("Authenticating user: " + user.username);
                res.jsonp(user);
            }
            else {
                console.error("Incorrect password!");
                res.status(401).jsonp({ error: "Invalid email and/or password" });
            }
        });
    });

    //app.getUser('')

    //app.post
    //app.delete


    // route to handle frontend
    // app.get('*', function(req, res) {
    //     res.sendFile(path.resolve('../mallpoint/www/index.html'));
    // });
}
