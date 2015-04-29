var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var mallpointSchema = new Schema({
    latitude:     { type: Number, required: true },
    longitude:    { type: Number, required: true },
    name:         { type: String, required: true },
    type:         { type: String, required: true },
    size:         { type: String, required: true },
    tags:         [ String ],
    owner:        { type: ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Mallpoint', mallpointSchema);
