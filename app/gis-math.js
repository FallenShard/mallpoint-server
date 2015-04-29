module.exports = (function () {

    var EARTH_MEAN_RADIUS = 6371;

    var radToDegPriv = function(rad) {
        return rad * 180 / Math.PI;
    };

    var degToRadPriv = function(deg) {
        return deg * Math.PI / 180;
    };

    return {
        radToDeg: radToDegPriv,
        degToRad: degToRadPriv,
        distance: function(lat1, lng1, lat2, lng2) {
            lat1 = degToRadPriv(lat1);
            lng1 = degToRadPriv(lng1);
            lat2 = degToRadPriv(lat2);
            lng2 = degToRadPriv(lng2);

            var dist = Math.acos(Math.sin(lat1) * Math.sin(lat2)
            + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng1 - lng2));

            return EARTH_MEAN_RADIUS * dist;
        },
        getLatRange: function(lat, radius) {
            return {
                min: lat - radToDegPriv(radius / EARTH_MEAN_RADIUS),
                max: lat + radToDegPriv(radius / EARTH_MEAN_RADIUS)
            }
        },
        getLngRange: function(lng, lat, radius) {
            return {
                min: lng - radToDegPriv(radius / EARTH_MEAN_RADIUS / Math.cos(degToRadPriv(lat))),
                max: lng + radToDegPriv(radius / EARTH_MEAN_RADIUS / Math.cos(degToRadPriv(lat)))
            }
        }
    };
}());
