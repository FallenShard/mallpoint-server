// app/models/user.js
// grab the mongoose module
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var mallpointSchema = new Schema({
    latitude:     { type: Number, required: true },
    longitude:    { type: Number, required: true },
    name:         { type: String, required: true },
    type:         { type: String, required: true },
    size:         { type: String, required: true, default: 'Shop' },
    tags:         [ String ],
    imageUrl:     { type: String },
    owner:        { type: ObjectId, ref: 'User'},
    ratings:      [{
        user:   { type: ObjectId, ref: 'User'},
        rating: { type: Number }
    }]
});

// define our mallpoint model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('Mallpoint', mallpointSchema);
