var webSocket = require('ws');

var gis       = require('./gis-math');

var mongoose  = require('mongoose');
var Mallpoint = require('./models/mallpoint');

module.exports = (function () {

    var webSocketServer = null;
    var connections = {};

    var guidCounter = 0;

    var radiusSearch = function(user, callback) {
        var radius = user.radius || 0.3;
        var lat = user.coords.lat;
        var lng = user.coords.lng;

        var lats = gis.getLatRange(lat, radius);
        var lngs = gis.getLngRange(lng, lat, radius);

        Mallpoint.find({})
        .where('latitude').gt(lats.min).lt(lats.max)
        .where('longitude').gt(lngs.min).lt(lngs.max)
        .exec(function(err, mallpoints) {
            if (err) {
                console.error(err);
                callback([]);
                return;
            }

            for (var i = 0; i < mallpoints.length; i++) {
                var pointDistance = gis.distance(lat, lng, mallpoints[i].latitude, mallpoints[i].longitude);
                if (pointDistance > radius) {
                    mallpoints.splice(i, 1);
                    i--;
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
            webSocketServer = new webSocket.Server({ port: port });

            console.log(new Date().timeNow() + ' WebSocket server is listening on port ' + port);

            webSocketServer.on('connection', function(clientWebSocket) {

                clientWebSocket.guid = guidCounter++;

                clientWebSocket.on('message', function(data) {
                    console.log(new Date().timeNow() + ' Socket ID: ' + clientWebSocket.guid);

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
                            addConnection(message, clientWebSocket);
                            radiusSearch(message, function(mallpoints) {
                                mallpoints = getNewPlaces(message.token, mallpoints);

                                if (mallpoints.length > 0)
                                {
                                    var response = {};
                                    response.type = 'mallpoints';
                                    response.mallpoints = mallpoints;

                                    clientWebSocket.send(JSON.stringify(response));
                                }
                            });
                    }
                });

                clientWebSocket.on('close', function(data) {
                    console.log (new Date().timeNow() + " Shutting down client with token " + clientWebSocket.guid);
                });

                var response = {};
                response.type = 'hello';
                response.token = clientWebSocket.guid;

                clientWebSocket.send(JSON.stringify(response));
            });
        }
    }
}());
