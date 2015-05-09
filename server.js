// server.js

Date.prototype.timeNow = function () {
     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

// Module init
var express        = require('express');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var mongoose       = require('mongoose');

var websocketServ  = require('./app/websocket-server');

var app            = express();

// Database setup
var db = require('./config/db');

// Port setup
var port = process.env.PORT || 5000;

// MongoDB database connection
mongoose.connect(db.url);

app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));

// CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "x-xsrf-token");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.use(express.static('../mallpoint/www'));

require('./app/routes/user-routes')(app);
require('./app/routes/mallpoint-routes')(app);


// Grab the network address
var os = require( 'os' );
var ifaces = os.networkInterfaces();
var serverIP = '';

Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
            return;
        }

        if (alias < 1) {
            serverIP = iface.address;
        }

        alias++;
    });
});


app.listen(port, function () {
    console.log(new Date().timeNow() + ' Node server starting up on address ' + serverIP);
    console.log(new Date().timeNow() + ' Express server is listening on port ' + port);

    websocketServ.listen(5001);
});

exports = module.exports = app;
