var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AutoIncrement = require('mongoose-sequence');

var Devices = new Schema({
    username: String,
    applianceId: Number,
    friendlyName: String,
    friendlyDescription: String,
    isReachable: Boolean,
    actions: [String],
    additionalApplianceDetails: {
    	extraDetail1: String,
    	extraDetail2: String,
    	extraDetail3: String,
    	extraDetail4: String
    }
});

Devices.plugin(AutoIncrement, {inc_field: 'applianceId'});

module.exports = mongoose.model('Devices', Devices);