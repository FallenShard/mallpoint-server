var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var User = require('../models/user');
var Mallpoint = require('../models/mallpoint');

module.exports = function(app) {

    var rad2deg = function(rad) {
        return rad * 180 / Math.PI;
    };

    var deg2rad = function(deg) {
        return deg * Math.PI / 180;
    };

    var distance = function(lat1, lng1, lat2, lng2) {
        lat1 = deg2rad(lat1);
        lng1 = deg2rad(lng1);
        lat2 = deg2rad(lat2);
        lng2 = deg2rad(lng2);

        var dist = Math.acos(Math.sin(lat1) * Math.sin(lat2)
        + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng1 - lng2));

        return 6371 * dist;
    }

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

    app.get('/api/mallpoints/radius', function(req, res) {
        var radius = 0.2;
        var lat = 43.3209022;
        var lng = 21.8957589;

        // earth's radius in km = ~6371
        var earthRadius = 6371;

        // latitude boundaries
        var maxlat = lat + rad2deg(radius / earthRadius);
        var minlat = lat - rad2deg(radius / earthRadius);

        // longitude boundaries
        var maxlng = lng + rad2deg(radius / earthRadius / Math.cos(deg2rad(lat)));
        var minlng = lng - rad2deg(radius / earthRadius / Math.cos(deg2rad(lat)));

        Mallpoint.find({}).where('latitude').gt(minlat).lt(maxlat).
        where('longitude').gt(minlng).lt(maxlng).exec(function(err, mallpoints) {
            if (err) {
                console.error(err);
                res.status(500).jsonp({ error: "There was an error with database"});
                return;
            }
            for (var i = 0; i < mallpoints.length; i++) {
                var pointDistance = distance(lat, lng, mallpoints[i].latitude, mallpoints[i].longitude);
                if (pointDistance > radius) {
                    mallpoints.splice(i, 1);
                }
            }

            res.status(200).jsonp(mallpoints);
        });
    });

    app.post('/api/mallpoints/user', function(req, res) {

        Mallpoint.find({ owner: req.body._id}).exec(function(err, mallpoints) {
            if (err) {
                console.error(err);
                res.status(500).jsonp({ error: "There was an error with database"});
                return;
            }

            console.log(mallpoints);

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
