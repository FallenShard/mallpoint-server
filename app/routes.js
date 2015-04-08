// routes/routes.js

// grab the model
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var ObjectId = mongoose.Schema.Types.ObjectId;
var User = require('./models/user');
var Mallpoint = require('./models/mallpoint');

module.exports = function(app) {

    // User-related API
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

    // Mallpoints-related API
    app.get('/api/mallpoints', function(req, res) {
        Mallpoint.find({}).populate('owner').exec(function(err, mallpoints) {
            if (err) {
                console.error(err);
                return;
            }

            res.jsonp(mallpoints);
        });
    });

    app.post('/api/savemp', function(req, res) {
        console.log(req.body);
        console.log("Creator: " + req.body.userId);
        User.findById(req.body.userId, function(err, user) {
            if (err) {
                console.error(err);
                return;
            }

            if (user) {
                var mallpoint = new Mallpoint();
                mallpoint.latitude = req.body.latitude;
                mallpoint.longitude = req.body.longitude;
                mallpoint.name = req.body.name;
                mallpoint.owner = user._id;
                mallpoint.save();
            }

            res.status(200).jsonp({ message: "Saved successfully"});
        });
    });
    // app.addStuff = function() {
    //
    //     User.findOne({ 'email': 'admin' }, function(err, user) {
    //         if (err) {
    //             console.error(err);
    //             return;
    //         }
    //
    //         if (user) {
    //             var mallpoint = new Mallpoint();
    //             mallpoint.latitude = 43.3209;
    //             mallpoint.longitude = 21.895;
    //             mallpoint.name = "My awesome mallpoint!";
    //             mallpoint.imageUrl = "img/mallpoint-login.png";
    //             mallpoint.owner = user;
    //             mallpoint.save();
    //         }
    //     });
    //
    //
    //
    // };

    //app.getUser('')

    //app.post
    //app.delete


    // route to handle frontend
    // app.get('*', function(req, res) {
    //     res.sendFile(path.resolve('../mallpoint/www/index.html'));
    // });
}
