var http = require('http');
var express = require('express');
var morgan = require('morgan');
var session = require('express-session');
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth2');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var app = express();
app.use(morgan("combined"));
app.use(session({
  // genid: function(req) {
  //   return genuuid() // use UUIDs for session IDs
  // },
  secret: 'boo',
  resave: true,
  saveUninitialized: false,
  name: 'bar',
  cookie: {
  	secure: true
  }
}));
app.use(passport.initialize());
app.use(passport.session());

var users = {};

passport.use(new OAuth2Strategy({
	// authorizationURL: 'https://alexa-node-red.eu-gb.mybluemix.net/auth/start',
	// tokenURL: 'https://alexa-node-red.eu-gb.mybluemix.net/auth/exchange',
	authorizationURL: 'https://localhost:3000/auth/start',
	tokenURL: 'https://localhost:3000/auth/exchange',
	clientID: '2',
	clientSecret: 'foobar',
	scope: "access_devices",
	callbackURL: 'http://localhost:3001/callback'
}, function(accessToken, refreshToken, profile, callback){
	console.log("accessToken: ", accessToken);
	console.log("refreshToken: ", refreshToken);
	console.log("profile: ",profile);
	profile.accessToken = accessToken;
	profile.refreshToken = refreshToken;
	profile.id = 0;
	callback(null,profile);
}));

passport.serializeUser(function(user, done){
	console.log("serialize user ",user);
	users[user.id] = user;
	done(null, user.id);
});
passport.deserializeUser(function(id, done){
	done(null,users[id]);
});

app.get('/start',passport.authenticate('oauth2'));

app.get('/callback',
	function(req,res,next){
		console.log("callback");
		console.log(req.body);
		console.log(req.params);
		next();
	},
	passport.authenticate('oauth2', { failureRedirect: '/login' }),
	function(req, res){
		console.log("callback part 2");
		res.redirect('/done');
});

app.get('/done',function(req,res){
	var options = {
		root: __dirname + '/public/',
		dotfiles: 'deny',
		headers: {
        	'x-timestamp': Date.now(),
        	'x-sent': true
    	}
	};
	res.sendFile('done.html',options,function(err){
		if (err) {
			console.log(err);
		}
	});
})

var port = 3001;
var host = '127.0.0.1';
var server = http.Server(app);
server.listen(port, host, function(){
	console.log('App listening on  %s:%d!', host, port);
});

console.log("done");