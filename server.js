// server.js

// modules
console.log("Including dependencies...");
var express = require('express');
var app = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var path = require('path');
//var bcrypt = require('bcrypt-nodejs');

// Database setup
console.log("Setting up database connection string...");
var db = require('./config/db');

// Port setup
var port = process.env.PORT || 5000;

// MongoDB database connection
console.log("Connecting to MongoLab database...");
mongoose.connect(db.url);
console.log("Connection successful!");

app.use(bodyParser.json());          // pull information from html in POST
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride('X-HTTP-Method-Override'));      // simulate DELETE and PUT

// CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "x-xsrf-token");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

console.log ("Setting up static page servicing from folder: " + path.resolve('../mallpoint/www'));
app.use(express.static('../mallpoint/www'));

require('./app/routes')(app);

//app.get('/sessions', sessions.findAll);
//app.get('/sessions/:id', sessions.findById);

// var User = require('./models/user');
//
// var salt = bcrypt.genSaltSync(10);
// var hash = bcrypt.hashSync('admin', salt);
// console.log("Admin hash: " + hash);
//
// var adminUser = new User({ username: "admin", passwordHash: hash, firstName: "admin"});
//
// adminUser.save(function (err, adminUser) {
//     if (err) return console.error(err);
//     console.log("Successfully saved: " + adminUser.username);
// });
//
// console.log(adminUser);


app.listen(port, function () {
    console.log('Express server is listening on port ' + port);
});

exports = module.exports = app;
