var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AutoIncrement = require('mongoose-sequence');

var Topics = new Schema({
	_id: Number,
	topics: {type: [String]}
},{ _id: false });

Topics.plugin(AutoIncrement, {inc_field: '_id'});

module.exports = mongoose.model('Topics', Topics);