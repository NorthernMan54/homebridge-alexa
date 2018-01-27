var oauth2orize = require('oauth2orize');
var OAuth = require('./models/oauth');

var server = oauth2orize.createServer();

server.grant(oauth2orize.grant.code({
	scopeSeparator: [ ' ', ',' ]
}, function(application, redirectURI, user, ares, done) {
	//console.log("grant user: ", user);
	OAuth.GrantCode.findOne({application: application, user: user},function(error,grant){
		if (!error && grant) {
			done(null,grant.code);
		} else if (!error) {
			var grant = new OAuth.GrantCode({
				application: application,
				user: user,
				scope: ares.scope
			});
			grant.save(function(error) {
				done(error, error ? null : grant.code);
			});
		} else {
			done(error,null);
		}
	});

	// var grant = new OAuth.GrantCode({
	// 	application: application,
	// 	user: user,
	// 	scope: ares.scope
	// });
	// grant.save(function(error) {
	// 	done(error, error ? null : grant.code);
	// });
}));

server.exchange(oauth2orize.exchange.code({
	userProperty: 'appl'
}, function(application, code, redirectURI, done) {
	OAuth.GrantCode.findOne({ code: code }, function(error, grant) {
		if (grant && grant.active && grant.application == application.id) {

			OAuth.AccessToken.findOne({application:application, user: grant.user, active: true}, function(error,token){
				if (token) {
					OAuth.RefreshToken.findOne({application:application, user: grant.user},function(error, refreshToken){
						if (refreshToken){
							done(null,token.token, refreshToken.token,{token_type: 'standard'});
						} else {
							// Shouldn't get here unless there is an error as there
							// should be a refresh token if there is an access token
							done(error);
						}
					});
				} else if (!error) {
					var token = new OAuth.AccessToken({
						application: grant.application,
						user: grant.user,
						grant: grant,
						scope: grant.scope
					});

					token.save(function(error){
						//delete old refreshToken or reuse?
						OAuth.RefreshToken.findOne({application:application, user: grant.user},function(error, refreshToken){
							if (refreshToken) {
								done(error, error ? null : token.token, refreshToken.token, error ? null : { token_type: 'standard' });
							} else if (!error) {
								var refreshToken = new OAuth.RefreshToken({
									user: grant.user,
									application: grant.application
								});

								refreshToken.save(function(error){
									done(error, error ? null : token.token, refreshToken.token, error ? null : { token_type: 'standard' });
								});
							} else {
								done(error);
							}
						});
					});
				} else {
					done(error);
				}
			});

			//console.log("exchange user ", grant.user);
			// var token = new OAuth.AccessToken({
			// 	application: grant.application,
			// 	user: grant.user,
			// 	grant: grant,
			// 	scope: grant.scope
			// });

			// token.save(function(error) {

			// 	var refreshToken = new OAuth.RefreshToken({
			// 		user: grant.user,
			// 		application: grant.application
			// 	});

			// 	refreshToken.save(function(error){
			// 		done(error, error ? null : token.token, refreshToken.token, error ? null : { token_type: 'standard' });
			// 	});
			// });
		} else {
			done(error, false);
		}
	});
}));

server.exchange(oauth2orize.exchange.refreshToken({
	userProperty: 'appl'
}, function(application, token, scope, done){
	console.log("Yay!");
	OAuth.RefreshToken.findOne({token: token}, function(error, refresh){
		if (refresh && refresh.application == application.id) {
			OAuth.GrantCode.findOne({},function(error, grant){
				if (grant && grant.active && grant.application == application.id){
					var newToken = new OAuth.AccessToken({
						application: refresh.application,
						user: refresh.user,
						grant: grant,
						scope: scope
					});

					newToken.save(function(error){
						if (!error) {
							done(null, newToken.token);
						} else {
							done(error,false);
						}
					});
				} else {
					done(error,null);
				}
			});
		} else {
			done(error, false);
		}
	});
}));

server.serializeClient(function(application, done) {
	done(null, application.id);
});

server.deserializeClient(function(id, done) {
	OAuth.Application.findById(id, function(error, application) {
		done(error, error ? null : application);
	});
});

module.exports = server;