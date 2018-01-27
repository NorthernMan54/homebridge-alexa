var uid = require('uid2');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LostPassword = new Schema({
	uuid: { type: String, unique: true, required: true, default: function() {
		return uid(42);
	}},
	user: { type: Schema.Types.ObjectId, ref: 'Account' },
	createdDate: { type: Date, expires: 86400 , default: function(){
		return new Date();
	}}
});

module.exports = mongoose.model('LostPassword', LostPassword);