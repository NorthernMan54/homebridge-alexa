var https = require('https');
var http = require('http');
var log = log;
var generateControlError = generateControlError;

/**
 * Main entry point.
 * Incoming events from Alexa Lighting APIs are processed via this method.
 */
exports.handler = function(event, context) {
    console.log('Input', event);

        switch (event.header.namespace) {

        case 'Alexa.ConnectedHome.Discovery':
            handleDiscovery(event, context);
        break;

        case 'Alexa.ConnectedHome.Control':
            handleControl(event, context);
        break;

        case 'System':
            if(event.header.name=="HealthCheckRequest"){
                var headers = {
                    namespace: 'System',
                    name: 'HealthCheckResponse',
                    payloadVersion: '2'
                };
                var payloads = {
                    "isHealthy": true,
                    "description": "The system is currently healthy"
                };
                var result = {
                    header: headers,
                    payload: payloads
                };

                context.succeed(result);
            }
        break;

		/**
		 * We received an unexpected message
		 */
        default:
            console.log('No supported namespace: ' + event.header.namespace);
            context.fail('Something went wrong');
        break;
    }
};

function handleDiscovery(event, context) {
    var options = {
        hostname: 'X.X.X.X',
        path: '/ifttt/discover.php',
        port: 8082
    };

    http.get(options, function(response) {
            var body = '';
            response.on('data', function(d) { body += d;});
                response.on('end', function() {
                var discoverResult = JSON.parse(body);

                var headers = {
                    namespace: 'Alexa.ConnectedHome.Discovery',
                    name: 'DiscoverAppliancesResponse',
                    payloadVersion: '2'
                };

                var payloads = {
                    discoveredAppliances: discoverResult
                };

               result = {
                    header: headers,
                    payload: payloads
                };

                context.succeed(result);
            });

            response.on("error",function(e){console.log("Got error: " + e.message);});
        });
}

function handleControl(event, context) {

    var headers = {
        namespace: event.header.namespace,
        name: event.header.name.replace("Request","Confirmation"),
        payloadVersion: '2',
        messageId: event.header.message_id
    };
    var payloads = {};

    var result = {
        header: headers,
        payload: payloads
    };

    var action;
    if (event.header.name == 'TurnOnRequest')
        action = "1";

    if (event.header.name == 'TurnOffRequest')
        action = "0";

    var options = {
        hostname: 'X.X.X.X',
        path: '/ifttt/indexd.php?device=' + encodeURI( JSON.stringify(event.payload) ) + '&action=' + event.header.name,
        port: 8082
    };

    http.get(options, function(response) {
            var body = '';
            response.on('data', function(d) { body += d;});
                response.on('end', function() {

                context.succeed(result);
            });

            response.on("error",function(e){console.log("Got error: " + e.message);});
        });

}
