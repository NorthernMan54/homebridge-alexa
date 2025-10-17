"use strict";

var messages = require('./parse/messages');
var debug = require('debug')('alexaMessages');

module.exports = {
  alexaResponse: alexaResponse,
  alexaStateResponse: alexaStateResponse,
  eventMessage: eventMessage
};

function alexaResponse(message, hbResponse, err, value) {
  var now = new Date();
  var response;

  if (err) {
    // Couldn't access HomeBridge
    response = {
      "event": {
        "header": {
          "namespace": "Alexa",
          "name": "ErrorResponse",
          "messageId": message.directive.header.messageId,
          "correlationToken": message.directive.header.correlationToken,
          "payloadVersion": "3"
        },
        "endpoint": {
          "endpointId": message.directive.endpoint.endpointId
        },
        "payload": {
          "type": "ENDPOINT_UNREACHABLE",
          "message": err.message
        }
      }
    };
  } else if (hbResponse && hbResponse.characteristics[0].status !== 0) {
    // HomeBridge returned an error
    response = {
      "event": {
        "header": {
          "namespace": "Alexa",
          "name": "ErrorResponse",
          "messageId": message.directive.header.messageId,
          "correlationToken": message.directive.header.correlationToken,
          "payloadVersion": "3"
        },
        "endpoint": {
          "endpointId": message.directive.endpoint.endpointId
        },
        "payload": {
          "type": "INVALID_VALUE",
          "message": "HAP Error " + hbResponse.characteristics[0].status
        }
      }
    };
  } else {
    switch (message.directive.header.namespace.toLowerCase()) {
      case "alexa":
        break;
      case "alexa.discovery":
        break;
      case "alexa.playbackcontroller":
        response = {
          "context": {
            "properties": []
          },
          "event": {
            "header": {
              "messageId": message.directive.header.messageId,
              "namespace": "Alexa",
              "name": "Response",
              "correlationToken": message.directive.header.correlationToken,
              "payloadVersion": "3"
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {}
          }
        };
        break;
      case "alexa.inputcontroller":
        response = {
          "context": {
            "properties": [{
              "namespace": "Alexa.InputController",
              "name": "input",
              "value": message.directive.payload.input,
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            }]
          },
          "event": {
            "header": {
              "messageId": message.directive.header.messageId,
              "namespace": "Alexa",
              "name": "Response",
              "correlationToken": message.directive.header.correlationToken,
              "payloadVersion": "3"
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {}
          }
        };
        break;
      case "alexa.powercontroller":
        response = {
          "context": {
            "properties": [{
              "namespace": "Alexa.PowerController",
              "name": "powerState",
              "value": message.directive.header.name.substr(4).toUpperCase(),
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            }]
          },
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "Response",
              "payloadVersion": "3",
              "messageId": message.directive.header.messageId,
              "correlationToken": message.directive.header.correlationToken
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {}
          }
        };
        break;
      case "alexa.modecontroller":
        response = {
          "context": {
            "properties": [{
              "namespace": "Alexa.ModeController",
              "instance": message.directive.header.instance,
              "name": "mode",
              "value": message.directive.payload.mode,
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            }]
          },
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "Response",
              "payloadVersion": "3",
              "messageId": message.directive.header.messageId,
              "correlationToken": message.directive.header.correlationToken
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {}
          }
        };
        break;
      case "alexa.lockcontroller":
        response = {
          "context": {
            "properties": [{
              "namespace": "Alexa.LockController",
              "name": "lockState",
              "value": (message.directive.header.name.toUpperCase() === "LOCK" ? "LOCKED" : "UNLOCKED"),
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            }]
          },
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "Response",
              "payloadVersion": "3",
              "messageId": message.directive.header.messageId,
              "correlationToken": message.directive.header.correlationToken
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {}
          }
        };
        break;
      case "alexa.rangecontroller":
        response = {
          "context": {
            "properties": [{
              "namespace": "Alexa.RangeController",
              "instance": message.directive.header.instance,
              "name": message.directive.header.name,
              "value": value,
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            }]
          },
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "Response",
              "payloadVersion": "3",
              "messageId": message.directive.header.messageId,
              "correlationToken": message.directive.header.correlationToken
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {}
          }
        };
        break;
      case "alexa.powerlevelcontroller":
        response = {
          "context": {
            "properties": [{
              "namespace": "Alexa.PowerLevelController",
              "name": "powerLevel",
              "value": value,
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            }]
          },
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "Response",
              "payloadVersion": "3",
              "messageId": message.directive.header.messageId,
              "correlationToken": message.directive.header.correlationToken
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {}
          }
        };
        break;
      case "alexa.stepspeaker":
        response = {
          "context": {
            "properties": []
          },
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "Response",
              "payloadVersion": "3",
              "messageId": message.directive.header.messageId,
              "correlationToken": message.directive.header.correlationToken
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {}
          }
        };
        break;
      case "alexa.speaker":
        response = {
          "context": {
            "properties": [{
              "namespace": "Alexa.Speaker",
              "name": "volume",
              "value": value,
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            },
            {
              "namespace": "Alexa.Speaker",
              "name": "muted",
              "value": false,
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            }
            ]
          },
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "Response",
              "payloadVersion": "3",
              "messageId": message.directive.header.messageId,
              "correlationToken": message.directive.header.correlationToken
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {}
          }
        };
        break;
      case "alexa.colorcontroller":
        response = {
          "context": {
            "properties": [{
              "namespace": "Alexa.ColorController",
              "name": "color",
              "value": message.directive.payload.color,
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            }]
          },
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "Response",
              "payloadVersion": "3",
              "messageId": message.directive.header.messageId,
              "correlationToken": message.directive.header.correlationToken
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {}
          }
        };
        break;
      case "alexa.channelcontroller":
        response = {
          "context": {
            "properties": [{
              "namespace": "Alexa.ChannelController",
              "name": "channel",
              "value": {
                "number": message.directive.payload.channel.number
              },
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            }]
          },
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "Response",
              "payloadVersion": "3",
              "messageId": message.directive.header.messageId,
              "correlationToken": message.directive.header.correlationToken
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {}
          }
        };
        break;
      case "alexa.colortemperaturecontroller":
        response = {
          "context": {
            "properties": [{
              "namespace": "Alexa.ColorTemperatureController",
              "name": "colorTemperatureInKelvin",
              "value": value,
              "timeOfSample": now.toISOString(),
              "uncertaintyInMilliseconds": 500
            }]
          },
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "Response",
              "payloadVersion": "3",
              "messageId": message.directive.header.messageId,
              "correlationToken": message.directive.header.correlationToken
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {}
          }
        };
        break;
      case "alexa.thermostatcontroller":
        switch (message.directive.header.name) {
          case "SetThermostatMode":
            response = {
              "context": {
                "properties": [{
                  "namespace": "Alexa.ThermostatController",
                  "name": "thermostatMode",
                  "value": {
                    "value": message.directive.payload.thermostatMode.value
                  },
                  "timeOfSample": now.toISOString(),
                  "uncertaintyInMilliseconds": 500
                }]
              },
              "event": {
                "header": {
                  "namespace": "Alexa",
                  "name": "Response",
                  "payloadVersion": "3",
                  "messageId": message.directive.header.messageId,
                  "correlationToken": message.directive.header.correlationToken
                },
                "endpoint": {
                  "endpointId": message.directive.endpoint.endpointId
                },
                "payload": {}
              }
            };
            break;
          case "SetTargetTemperature":
            var properties = [];
            for (var index in message.directive.payload) {
              properties.push({
                "namespace": "Alexa.ThermostatController",
                "name": "targetSetpoint",
                "value": {
                  "value": message.directive.payload[index].value,
                  "scale": message.directive.payload[index].scale
                },
                "timeOfSample": now.toISOString(),
                "uncertaintyInMilliseconds": 500
              });
            }
            response = {
              "context": {
                "properties": properties
              },
              "event": {
                "header": {
                  "namespace": "Alexa",
                  "name": "Response",
                  "payloadVersion": "3",
                  "messageId": message.directive.header.messageId,
                  "correlationToken": message.directive.header.correlationToken
                },
                "endpoint": {
                  "endpointId": message.directive.endpoint.endpointId
                },
                "payload": {}
              }
            };
            break;
        }
        break;

      default:
        console.log("alexaResponse - Unhandled Alexa Directive", message.directive.header.namespace);
        response = {
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "ErrorResponse",
              "messageId": message.directive.header.messageId,
              "correlationToken": message.directive.header.correlationToken,
              "payloadVersion": "3"
            },
            "endpoint": {
              "endpointId": message.directive.endpoint.endpointId
            },
            "payload": {
              "type": "INTERNAL_ERROR",
              "message": "Unhandled Alexa Directive"
            }
          }
        };
    }
  }
  // debug("alexaResponse", JSON.stringify(response, null, 4));
  return response;
}

//
// alexaMessages.alexaStateResponse(message, reportState, status, err);
// message, reportState, hbResponse, err
function alexaStateResponse(properties, message) {
  // debug("alexaStateResponse", properties, JSON.stringify(message, null, 2));
  var endpointId = message.directive.endpoint.endpointId;
  var messageId = message.directive.header.messageId;
  var correlationToken = message.directive.header.correlationToken;
  var response;

  if (properties instanceof Error || properties[0].length === 0) {
    // console.log("ERROR: alexaStateResponse", properties.message);
    response = {
      "event": {
        "header": {
          "namespace": "Alexa",
          "name": "ErrorResponse",
          "messageId": messageId,
          "correlationToken": correlationToken,
          "payloadVersion": "3"
        },
        "endpoint": {
          "endpointId": endpointId
        },
        "payload": {
          "type": "ENDPOINT_UNREACHABLE",
          "message": properties.message
        }
      }
    };
  } else {
    switch (message.directive.header.name.toLowerCase()) {
      case "reportstate":
        response = {
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "StateReport",
              "messageId": messageId,
              "correlationToken": correlationToken,
              "payloadVersion": "3"
            },
            "endpoint": {
              "endpointId": endpointId
            },
            "payload": {}
          },
          "context": {
            "properties": properties[0]
          }
        };

        break;

      default:
        console.log("Unhandled alexaStateResponse Directive", message.directive.header.name);
        response = {
          "event": {
            "header": {
              "namespace": "Alexa",
              "name": "ErrorResponse",
              "messageId": messageId,
              "correlationToken": correlationToken,
              "payloadVersion": "3"
            },
            "endpoint": {
              "endpointId": endpointId
            },
            "payload": {
              "type": "INTERNAL_ERROR",
              "message": "Unhandled alexaStateResponse Directive"
            }
          }
        };
    }
  }
  // debug("alexaStatusResponse", JSON.stringify(response, null, 2));
  return response;
}

function eventMessage(event, device) {
  var now = new Date();
  // {"host":"192.168.1.215","port":51826,"aid":2,"iid":10,"status":true}

  var message;
  try {
    // debug("Device", device);
    if (device) {
      switch (device.template) {
        case "DoorbellEventSource":
          message = {
            "context": {},
            "event": {
              "header": {
                "messageId": messages.createMessageId(),
                "namespace": "Alexa.DoorbellEventSource",
                "name": "DoorbellPress",
                "payloadVersion": "3"
              },
              "endpoint": {
                "endpointId": device.endpointID
              },
              "payload": {
                "cause": {
                  "type": "PHYSICAL_INTERACTION"
                },
                "timestamp": now.toISOString(),
              }
            }
          };
          break;
        case "ContactSensor":
          message = {
            "context": {},
            "event": {
              "header": {
                "messageId": messages.createMessageId(),
                "namespace": "Alexa",
                "name": "ChangeReport",
                "payloadVersion": "3"
              },
              "endpoint": {
                "endpointId": device.endpointID
              },
              "payload": {
                "change": {
                  "cause": {
                    "type": "PHYSICAL_INTERACTION"
                  },
                  "properties": [{
                    "namespace": "Alexa.ContactSensor",
                    "name": "detectionState",
                    "value": device[event.value.toString()],
                    "timeOfSample": now.toISOString(),
                    "uncertaintyInMilliseconds": 500
                  }]
                }
              }
            }
          };
          break;
        case "MotionSensor":
          message = {
            "context": {},
            "event": {
              "header": {
                "messageId": messages.createMessageId(),
                "namespace": "Alexa",
                "name": "ChangeReport",
                "payloadVersion": "3"
              },
              "endpoint": {
                "endpointId": device.endpointID
              },
              "payload": {
                "change": {
                  "cause": {
                    "type": "PHYSICAL_INTERACTION"
                  },
                  "properties": [{
                    "namespace": "Alexa.MotionSensor",
                    "name": "detectionState",
                    "value": device[event.value.toString()],
                    "timeOfSample": now.toISOString(),
                    "uncertaintyInMilliseconds": 500
                  }]
                }
              }
            }
          };
          break;
        case "LockController":
          message = {
            "context": {},
            "event": {
              "header": {
                "messageId": messages.createMessageId(),
                "namespace": "Alexa",
                "name": "ChangeReport",
                "payloadVersion": "3"
              },
              "endpoint": {
                "endpointId": device.endpointID
              },
              "payload": {
                "change": {
                  "cause": {
                    "type": "PHYSICAL_INTERACTION"
                  },
                  "properties": [{
                    "namespace": "Alexa.LockController",
                    "name": "lockState",
                    "value": device[event.value.toString()],
                    "timeOfSample": now.toISOString(),
                    "uncertaintyInMilliseconds": 500
                  }]
                }
              }
            }
          };
          break;
        case "TemperatureSensor":
          message = {
            "context": {},
            "event": {
              "header": {
                "messageId": messages.createMessageId(),
                "namespace": "Alexa",
                "name": "ChangeReport",
                "payloadVersion": "3"
              },
              "endpoint": {
                "endpointId": device.endpointID
              },
              "payload": {
                "change": {
                  "cause": {
                    "type": "PHYSICAL_INTERACTION"
                  },
                  "properties": [{
                    "namespace": "Alexa.TemperatureSensor",
                    "name": "detectionState",
                    "value": {
                      "value": messages.round(event.value, 1),
                      "scale": "CELSIUS"
                    },
                    "timeOfSample": now.toISOString(),
                    "uncertaintyInMilliseconds": 500
                  }]
                }
              }
            }
          };
          break;
        default:
          console.log("ERROR: homebridge-alexa.alexaMessages Unsupported event source", device.template);
      }
    } else {
      console.log("ERROR: homebridge-alexa.alexaMessages Missing device");
    }
  } catch (err) {
    // console.log("ERROR: homebridge-alexa.alexaMessages.eventMessage", err);
  }
  return (message);
}
