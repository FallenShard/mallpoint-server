// app/models/user.js
// grab the mongoose module
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    username:     { type: String, required: true, unique: true },
    email:        { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    firstName:    { type: String, required: true },
    lastName:     { type: String, required: true }
});

// define our user model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('User', userSchema);
