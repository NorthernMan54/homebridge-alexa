var fs = require('fs');
var url = require('url');

var http = require('http');
var https = require('https');
var express = require('express');
// var session = require('express-session');
// var json2html = require('node-json2html');
var bodyParser = require('body-parser');

var port = (process.env.VCAP_APP_PORT || process.env.PORT || 3000);
var host = '127.0.0.1';

var app_id = 'https://localhost:' + port;

var cookieSecret = 'ihytsrf334';

var app = express();

app.set('view engine', 'ejs');
app.enable('trust proxy');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

function requireHTTPS(req, res, next) {
  if (req.get('X-Forwarded-Proto') === 'http') {
    // FYI this should work for local development as well
    var url = 'https://' + req.get('host');
    if (req.get('host') === 'localhost') {
      url += ':' + port;
    }
    url += req.url;
    return res.redirect(url);
  }
  next();
}

// app.use(requireHTTPS);

app.use('/', express.static('static'));

//
// Start of Alexa message handler
//

app.put('/characteristics',
  function(req, res, next) {
    // Handle HomeKit message
    console.log("Request - PUT", req.originalUrl);
    res.status(207).send("[ value: 0]");
  }
);

app.get('/characteristics',
  function(req, res) {
    // Handle HomeKit message
    console.log("Request - GET", req.originalUrl);
    res.status(207).send("{ \"characteristics\": [{ \"aid\": 3, \"iid\": 10, \"value\": 1}] }");

  }
);

var server = http.Server(app);

server.listen(port, host, function() {
  console.log('App listening on  %s:%d!', host, port);
  console.log("App_ID -> %s", app_id);

  setTimeout(function() {

  }, 5000);
});
