var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var gis = require('../gis-math');

var ObjectId = mongoose.Schema.Types.ObjectId;

var User = require('../models/user');
var Mallpoint = require('../models/mallpoint');

module.exports = function(app) {

    app.post('/api/mallpoints/radius', function(req, res) {
        var radius = req.body.radius || 0.3;
        var lat = req.body.lat;
        var lng = req.body.lng;

        var lats = gis.getLatRange(lat, radius);
        var lngs = gis.getLngRange(lng, lat, radius);

        Mallpoint.find({}).populate('owner')
        .where('latitude').gt(lats.min).lt(lats.max)
        .where('longitude').gt(lngs.min).lt(lngs.max)
        .exec(function(err, mallpoints) {
            if (err) {
                console.error(err);
                res.status(500).jsonp({ error: "There was an error with database"});
                return;
            }

            for (var i = 0; i < mallpoints.length; i++) {
                var pointDistance = gis.distance(lat, lng, mallpoints[i].latitude, mallpoints[i].longitude);
                if (pointDistance > radius) {
                    mallpoints.splice(i, 1);
                    i--;
                }
            }

            res.status(200).jsonp(mallpoints);
        });
    });

    app.post('/api/mallpoints/search', function(req, res) {
        var filter = {};
        if (req.body.tags)
            filter.tags = req.body.tags.split(',');
        else
            filter.tags = [];

        filter.size = req.body.size || '';

        var sizeQuery = null;
        if (filter.size !== '') {
            sizeQuery = {};
            sizeQuery.size = filter.size;
        }

        var tagsQuery = null;
        if (filter.tags.length !== 0) {
            var regexes = [];
            for (var i = 0; i < filter.tags.length; i++)
                regexes.push(new RegExp(filter.tags[i], 'i'));

            tagsQuery = {};
            tagsQuery.$or = [];
            tagsQuery.$or.push({ name: { $in: regexes } });
            tagsQuery.$or.push({ type: { $in: regexes } });
            tagsQuery.$or.push({ tags: { $in: regexes } });
        }

        var mainQuery = {};
        if (sizeQuery && tagsQuery) {
            mainQuery.$and = [sizeQuery, tagsQuery];
        }
        else if (sizeQuery) {
            mainQuery = sizeQuery;
        }
        else if (tagsQuery)
            mainQuery = tagsQuery;

        Mallpoint.find(mainQuery).exec(function(err, mallpoints) {
            if (err) {
                console.error(err);
                res.status(500).jsonp({ error: "There was an error with database"});
                return;
            }

            res.status(200).jsonp(mallpoints);
        });
    });

    app.post('/api/mallpoints/user', function(req, res) {
        Mallpoint.find({ owner: req.body.userId }).exec(function(err, mallpoints) {
            if (err) {
                console.error(err);
                res.status(500).jsonp({ error: "There was an error with database"});
                return;
            }

            res.status(200).jsonp(mallpoints);
        });
    });

    app.post('/api/mallpoints/create', function(req, res) {
        User.findById(req.body.userId, function(err, user) {
            if (err) {
                console.error(err);
                res.status(500).jsonp({ error: "There was an error with database"});
                return;
            }

            if (user) {
                req.body.tags = req.body.tags || '';
                var mallpoint = new Mallpoint();
                mallpoint.latitude = req.body.latitude;
                mallpoint.longitude = req.body.longitude;
                mallpoint.name = req.body.name;
                mallpoint.type = req.body.type;
                mallpoint.size = req.body.size;
                mallpoint.tags = req.body.tags.split(',');
                mallpoint.owner = user._id;
                mallpoint.save(function (err, mallpoint) {
                  if (err) {
                      console.error(err);
                      res.status(500).jsonp({ error: "There was an error with database"});
                      return;
                  }

                  console.log("Saving a new mallpoint to MongoDB");
                  res.status(200).jsonp(mallpoint);
                });
            }
            else {
                res.status(403).jsonp({ error: "There was an error processing your request"});
            }
        });
    });
};
