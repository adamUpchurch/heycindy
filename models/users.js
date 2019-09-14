var mongoose = require('mongoose')

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    first_name: {type: String, max: 100},
    family_name: {type: String, max: 100},
    company_name: {type: String, max: 100},
    common_phrase: {type: String, max: 100},
    email: {type: String, unique: true},
    googleID: {type: String},
    twitterCredentials: {
        consumer_key: {type: String},
        consumer_secret: {type: String},
        access_token: {type: String},
        access_token_secret: {type: String},
    },
    profile_pic: {type: String},
    password: {
        type: String
    }
})


// Virtual for User's name
UserSchema
    .virtual('name')
    .get(function() {
        return this.family_name + ', ' + this.first_name;
    });

UserSchema
    .virtual('url')
    .get(function() {
        return `/user/${this._id}`
    });

    module.exports = mongoose.model('User', UserSchema)