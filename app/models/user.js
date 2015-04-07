// app/models/user.js
// grab the mongoose module
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    username:     String,
    email:        String,
    passwordHash: String,
    firstName:    String,
    lastName:     String
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.verifyPassword = function(password) {
    return bcrypt.compareSync(password, this.user.password);
};

// define our user model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('User', userSchema);
