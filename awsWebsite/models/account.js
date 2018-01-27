var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    password: String,
    email: String,
    mqttPass: { type: String, default: '' },
    superuser: { type: Number, default: 0},
    topics: { type: Number},
    created: { type: Date, default: function(){
        return new Date();
    }}
});

var options = {
	usernameUnique: true,
	saltlen: 12,
	keylen: 24,
	iterations: 901,
	encoding: 'base64'
};

Account.plugin(passportLocalMongoose,options);

module.exports = mongoose.model('Account', Account);
