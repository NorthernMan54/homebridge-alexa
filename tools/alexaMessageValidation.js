// var alexaTranslator = require('../lib/alexaTranslator.js');

var alexaActions = require('../lib/alexaActions.js');
// var debug = require('debug')('parse');
var Validator = require('is-my-json-valid');
var alexaSchema = require('../lib/alexa_smart_home_message_schema.json');
var checkAlexaMessage = Validator(alexaSchema, {
  verbose: true
});

var message = {
  directive: {
    header: {
      namespace: 'Alexa',
      name: 'ReportState',
      payloadVersion: '3',
      messageId: '6099a5cc-cf6d-44c9-8064-fe8ce59ee35b',
      correlationToken: 'AAAAAAAAAADt2sLI4Hz2peb5lBxJtNkGDAIAAAAAAADPGyE/uoxQsgF1BvFvUC2PMapMttz1MtFAyQnY+o46NaAODOO0WADRF77eCWAAphYQvslarU9DYi7nRJwpsVQmXT26fuJMGxz31BloNX6y2Xiee03d4UW+yqElOGlvSoxF8980pfYFoWSRq3witdkCgN8ymOVJVpHUGYVV+AAQq4oU1kWqUVdBihs2NVnjTOWoDICSy7zpB7ut7Qim2Yv78uyaDj17c+oRJ0rlvWkRojp4uU8QuLT/fYJLnrZnBAxjv7oLQ1chbx1PmglJahLAcJYPQrSKfGU8DLGA7Aw98dUHxRq4zCdkREs5dFqyTebEC0cL1CBeGOk6NkVqKmsuX748KJGYI+k2QniiB0sL3JY7SN5ntVkpAd7kgRWwgPmLMtSjxfvIkQv11TUBTR90GhHvGAZDHpOy+LdIwiMdwiFFBx6dDIXa8wzbSAM+LSTfzYbeXl1AFRk0EfTlwckWFlgYkAGFHVJLlYZNGSjsdleceEWi8YQutAkqUHFZtYR0dewg3R4sk7wWRP7uMxbOowJRkZOFitEO0JTo/dtyHFWDwe8VFZRAQ5SwLFNY+CnaHA05oT08UvRznPUvCQsxkd1E1X43uEJCbWFDdtaVhfdf+k/uBtmVHZ5S9L4WaMmUU4dSXx1U6Z+c8B+sVlql1jqTJMKdIqJZAi3M3vOvyH0Z1QcYQFZ9pO+paQ=='
    },
    endpoint: {
      endpointId: 'MTkyLjE2OC4xLjQxOjUxODI2LGFpZDogMyxpaWQ6IDEw',
      cookie: {
        ReportState: '[{"interface":"Alexa.ContactSensor","host":"127.0.0.1","port":3000,"aid":3,"iid":10}]'
      }
    },
    payload: {}
  }
};

var context = {};

context.log = console.log;

context.log("This", context);

alexaActions.alexaMessage.call(context, message, function(error, response) {
  if (error) {
    console.log("ERROR:", error, response);
  } else {
    console.log("Message:", response);
  }
  var status = checkAlexaMessage(response);
  if (!status) {
    console.log("WARNING - Bad message", JSON.stringify(checkAlexaMessage.errors, null, 4));
    console.log("---------------------------- Response -------------------------------");
    console.log(JSON.stringify(response, null, 4));
    console.log("------------------------------------------------------------");
  } else {
    console.log("Alexa Message Validation Passed!");
  }
});
