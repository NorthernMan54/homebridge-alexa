var request = require('request');
var querystring = require('querystring');

var baseURL = "https://www.google-analytics.com/";

var Measurements = function(tid) {
	this.tid = tid;
};

Measurements.prototype.send = function(options) {

	if (!this.tid){
		return;
	}
	var required = {
		v: 1,
		tid: this.tid,
		t: 'event'
	};
	var url = baseURL;
	var body;
	if (Array.isArray(options)) {
		for (var i=0; i<options.length && i < 20; i++) {
			var temp = Object.assign(required, options[i]);
			body += querystring.stringify(temp);
			body += "\n";
		}

		url += "batch";
	} else {
		options = Object.assign(required, options);
		body = querystring.stringify(options);
		url += "collect";
	}
	// console.log(body);
	request.post({url: url, body: body},
		function(err, response, body){
			if (err) {
				console.log(err);
			}

			// console.log("Analytics response: %d",response.statusCode);
			// console.log(response.headers);
			// console.log(body);
		});
}

module.exports = Measurements;