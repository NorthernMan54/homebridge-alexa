var request = require('request');
var oauth_id;
var messageId;

exports.handler = function(event, context, callback) {
  log("Entry", event);

  if (event.directive.header.namespace === 'Alexa' && event.directive.header.payloadVersion === '3') {
    log("Troubleshoot", event.directive.endpoint, event.directive.header);
    messageId = event.directive.header.messageId;
    oauth_id = event.directive.endpoint.scope.token;
    delete event.directive.endpoint.scope; // Remove oauth token from message body
    sendMessage(event, context, callback);
  } else if (event.directive.header.payloadVersion === '3') {
    if ( event.directive.endpoint != undefined )
      {
        oauth_id = event.directive.endpoint.scope.token;
        delete event.directive.endpoint.scope;
      } else if ( event.directive.payload != undefined ) {
        oauth_id = event.directive.payload.scope.token;
        delete event.directive.payload.scope; // Remove oauth token from message body
      }
    sendMessage(event, context, callback);
  } else {
    log("Unexpected playloadversion", event.directive.header.payloadVersion);
    callback(new Error("Unexpected playloadversion"), null);
  }
};


function sendMessage(event, context, callback) {

  // Pass Alexa Directive to message router

  var message_id = createMessageId();
  request.post('https://homebridge.cloudwatch.net/api/v2/messages', {
    auth: {
      'bearer': oauth_id
    },
    timeout: 8000,
    headers: {
      'Content-Type': 'application/json',
      'messageId': message_id
    },
    body: JSON.stringify(event)

  }, function(err, response, body) {
    log("Response", body);
    if (response.statusCode == 200) {
      log('Alexa Directive', "success");
      callback(null, JSON.parse(body));
    } else if (response.statusCode == 401) {
      log('Alexa Directive', "Auth failure");

      var response = {
        header: {
          messageId: message_id,
          name: "ErrorResponse",
          namespace: "Alexa",
          payloadVersion: "3"
        },
        payload: {
          discoveredAppliances: []
        }
      };

      //context.succeed(response);
      callback(null, response);
    } else {
      log('Unknown Response', response.statusCode);

      var response = {
        header: {
          messageId: message_id,
          name: "ErrorResponse",
          namespace: "Alexa",
          payloadVersion: "3"
        },
        payload: {
          discoveredAppliances: []
        }
      };

      //context.succeed(response);
      callback(null, response);
    }

  }).on('error', function(error) {
    log('Internal Error:', error);

    callback(error, null);
  });

};

function createMessageId() {
  var d = new Date().getTime();

  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
    function(c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

  return uuid;
}


function log(title, msg) {
  console.log('*************** ' + title + ' *************');
  console.log(msg);
  console.log('*************** ' + title + ' End*************');
}
