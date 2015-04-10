var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var User = require('../models/user');
var Mallpoint = require('../models/mallpoint');

module.exports = function(app) {

    app.get('/api/mallpoints', function(req, res) {
        Mallpoint.find({}).populate('owner').exec(function(err, mallpoints) {
            if (err) {
                console.error(err);
                res.status(500).jsonp({ error: "There was an error with database"});
                return;
            }

            res.status(200).jsonp(mallpoints);
        });
    });

    app.post('/api/mallpointcreate', function(req, res) {
        User.findById(req.body.userId, function(err, user) {
            if (err) {
                console.error(err);
                res.status(500).jsonp({ error: "There was an error with database"});
                return;
            }

            if (user) {
                var mallpoint = new Mallpoint();
                mallpoint.latitude = req.body.latitude;
                mallpoint.longitude = req.body.longitude;
                mallpoint.name = req.body.name;
                mallpoint.type = req.body.type;
                mallpoint.owner = user._id;
                mallpoint.save();
                console.log("Saving a new mallpoint to MongoDB");
                res.status(200).jsonp({ message: "Saved successfully"});
            }
            else {
                res.status(403).jsonp({ error: "There was an error processing your request"});
            }
        });
    });
};
