var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var userSchema = new Schema({
    username:     { type: String, required: true, unique: true },
    email:        { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    firstName:    { type: String, required: true },
    lastName:     { type: String, required: true },
    favorites:    [{ type: ObjectId, ref: 'Mallpoint'}]
});

module.exports = mongoose.model('User', userSchema);
