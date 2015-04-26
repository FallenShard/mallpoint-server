var WebSocketServer = require('ws').Server;

var mongoose        = require('mongoose');
var Mallpoint       = require('./models/mallpoint');

module.exports = (function () {

    var wss = null;
    var connections = {};

    var guidCounter = 0;

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
    };

    var radiusSearch = function(user, callback) {
        var radius = 0.3;
        var lat = user.coords.lat;
        var lng = user.coords.lng;

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
                return [];
            }

            for (var i = 0; i < mallpoints.length; i++) {
                var pointDistance = distance(lat, lng, mallpoints[i].latitude, mallpoints[i].longitude);
                if (pointDistance > radius) {
                    mallpoints.splice(i, 1);
                }
            }

            callback(mallpoints);
        });
    };

    var addConnection = function(connection, socket) {
        if (!connections[connection.token]) {
            console.log("Adding");
            console.log(connection);
            connections[connection.token] = {};
            connections[connection.token].connection = connection;
            connections[connection.token].socket = socket;
            connections[connection.token].visited = [];
        }
    };

    var removeConnection = function(token) {
        if (connections[token]) {
            connections[token].socket.close();
            delete connections[token];
            return true;
        }

        return false;
    };

    var getNewPlaces = function(token, mallpoints) {
        var conn = connections[token];

        var places = [];
        for (var i = 0; i < mallpoints.length; i++) {
            var idx = conn.visited.indexOf(mallpoints[i]._id.toString());
            if (idx === -1) {
                conn.visited.push(mallpoints[i]._id.toString());
                places.push(mallpoints[i]);
            }
        }

        return places;
    };

    return {
        listen: function(port) {
            wss = new WebSocketServer({ port: port });

            wss.on('connection', function(ws) {

                ws.guid = guidCounter++;

                ws.on('message', function(data) {
                    console.log(new Date().timeNow() + ' Socket ID: ' + ws.guid);

                    var message = null;
                    try {
                        message = JSON.parse(data);
                    }
                    catch (err) {
                        console.error(err);
                        return;
                    }

                    switch (message.type) {
                        case 'hello':
                            return;

                        case 'remove':
                            console.log("Removing connection: " + message.token);
                            removeConnection(message.token);
                            return;

                        case 'data':
                            addConnection(message, ws);
                            radiusSearch(message, function(mallpoints) {
                                mallpoints = getNewPlaces(message.token, mallpoints);

                                if (mallpoints.length > 0)
                                {
                                    var reply = {};
                                    reply.type = 'mallpoints';
                                    reply.mallpoints = mallpoints;

                                    ws.send(JSON.stringify(reply));
                                }
                            });
                    }
                });

                ws.on('close', function(data) {
                    console.log ("Shutting down...");
                });

                var response = {};
                response.type = 'hello';
                response.token = ws.guid;

                ws.send(JSON.stringify(response));
            });
        }
    }
}());
