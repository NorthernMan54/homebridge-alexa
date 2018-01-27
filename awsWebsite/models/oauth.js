var uid = require('uid2');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AutoIncrement = require('mongoose-sequence');

var ApplicationSchema = new Schema({
	title: { type: String, required: true },
	oauth_id: { type: Number, unique: true },
	oauth_secret: { type: String, unique: true, default: function() {
			return uid(42);
		}
	},
	domains: [ { type: String } ]
});

var GrantCodeSchema = new Schema({
	code: { type: String, unique: true, default: function() {
			return uid(24);
		}
	},
	user: { type: Schema.Types.ObjectId, ref: 'Account' },
	application: { type: Schema.Types.ObjectId, ref: 'Application' },
	scope: [ { type: String } ],
	active: { type: Boolean, default: true }
});

var AccessTokenSchema = new Schema({
	token: { type: String, unique: true, default: function() {
			return uid(124);
		}
	},
	user: { type: Schema.Types.ObjectId, ref: 'Account' },
	application: { type: Schema.Types.ObjectId, ref: 'Application' },
	grant: { type: Schema.Types.ObjectId, ref: 'GrantCode' },
	scope: [ { type: String }],
	expires: { type: Date, default: function(){
		var today = new Date();
		//var length = 60 * 24 * 90; // Length (in minutes) of our access token
		var length = 60 * 24 * 365 * 100;
		return new Date(today.getTime() + length*60000);
	} },
	active: { type: Boolean, get: function(value) {
		if (this.expires < new Date() || !value) {
			return false;
		} else {
			return value;
		}
	}, default: true }
});

var RefreshTokenSchema = new Schema({
	token: { type: String, unique: true, default: function(){
		return uid(124);
	}},
	user: { type: Schema.Types.ObjectId, ref: 'Account' },
	application: { type: Schema.Types.ObjectId, ref: 'Application' }
});

ApplicationSchema.plugin(AutoIncrement, {inc_field: 'oauth_id'});

var Application = mongoose.model('Application', ApplicationSchema);
var GrantCode = mongoose.model('GrantCode', GrantCodeSchema);
var AccessToken = mongoose.model('AccessToken', AccessTokenSchema);
var RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

module.exports = {
	Application: Application,
	GrantCode: GrantCode,
	AccessToken: AccessToken,
	RefreshToken: RefreshToken
}