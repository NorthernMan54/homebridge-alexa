**Troubleshooting Tips**

<!--ts-->
* [Initial Setup](#initial-setup)
   * [[Alexa] ERROR: ( homebridge-alexa) Login to homebridge.ca failed, please validate your credentials in config.json and restart homebridge.](#alexa-error--homebridge-alexa-login-to-homebridgeca-failed-please-validate-your-credentials-in-configjson-and-restart-homebridge)
      * [- Bad login or password in your config.json for <a href="https://www.homebridge.ca" rel="nofollow">https://www.homebridge.ca</a>](https://www.homebridge.ca)
   * [[Alexa] ERROR: ( homebridge-alexa) You have an issue with your installation, please review the README.](#alexa-error--homebridge-alexa-you-have-an-issue-with-your-installation-please-review-the-readme)
      * [- Cloud Server DDOS Protection has blocked your IP address](#--cloud-server-ddos-protection-has-blocked-your-ip-address)
      * [- Multiple copies of homebridge-alexa on your network](#--multiple-copies-of-homebridge-alexa-on-your-network)
      * [- VPN Software interfering with homebridge-alexa to homebridge.ca communications](#--vpn-software-interfering-with-homebridge-alexa-to-homebridgeca-communications)
   * [[Alexa] ERROR: ( homebridge-alexa) Stopping Home Skill connection due to excessive reconnects, please review the README.](#alexa-error--homebridge-alexa-stopping-home-skill-connection-due-to-excessive-reconnects-please-review-the-readme)
   * [[Alexa] WARNING: Duplicate device name xxxxx](#alexa-warning-duplicate-device-name-xxxxx)
* [Initial Setup Messages from DEBUG mode](#initial-setup-messages-from-debug-mode)
   * [alexaHAP HAP Discover failed ... is not running in insecure mode](#alexahap-hap-discover-failed--is-not-running-in-insecure-mode)
   * [HAP Discover failed ..... error code 470](#hap-discover-failed--error-code-470)
   * [Upgraded from old version and am seeing this error message](#upgraded-from-old-version-and-am-seeing-this-error-message)
   * [[Alexa] ERROR: HAP Discovery failed, please review config](#alexa-error-hap-discovery-failed-please-review-config)
   * [alexaLocal ERROR: connect ECONNREFUSED 35.169.132.61:1883 -&gt;  ECONNREFUSED](#alexalocal-error-connect-econnrefused-35169132611883----econnrefused)
   * [alexaLocal error { Error: connect ECONNREFUSED 35.169.132.61:8883](#alexalocal-error--error-connect-econnrefused-35169132618883)
* [Device Discovery](#device-discovery)
   * [Device discovery fails and the plugin logs show no issues.](#device-discovery-fails-and-the-plugin-logs-show-no-issues)
   * [Device discovery fails, and this message is in the logs ERROR: Empty accessory name, parsing failed.](#device-discovery-fails-and-this-message-is-in-the-logs-error-empty-accessory-name-parsing-failed)
   * [Device discovery fails, and this message is in the logs ERROR: Maximum devices/accessories of 300 exceeded.](#device-discovery-fails-and-this-message-is-in-the-logs-error-maximum-devicesaccessories-of-300-exceeded)
   * [Device discovery fails, and this message is in the logs ERROR: Parsing failed, duplicate endpointID.](#device-discovery-fails-and-this-message-is-in-the-logs-error-parsing-failed-duplicate-endpointid)
   * [After restarting homebridge Alexa can't find devices and needs to discover them again.  Or you have duplicate devices in Alexa](#after-restarting-homebridge-alexa-cant-find-devices-and-needs-to-discover-them-again--or-you-have-duplicate-devices-in-alexa)
* [Controlling devices](#controlling-devices)
   * [[Alexa] PowerController TurnOff 192.168.1.226 51826 undefined Error: Homebridge auth failed, invalid PIN](#alexa-powercontroller-turnoff-1921681226-51826-undefined-error-homebridge-auth-failed-invalid-pin)
* [Event error messages](#event-error-messages)
   * [[Alexa] WARNING: ( homebridge-alexa) Dropped event message, message rate too high.](#alexa-warning--homebridge-alexa-dropped-event-message-message-rate-too-high)
   * [ERROR:  Error: getAccessToken No data Error: XXXXXXXXXX](#error--error-getaccesstoken-no-data-error-xxxxxxxxxx)
   * [ERROR:  Error: getAccessToken Token not found](#error--error-getaccesstoken-token-not-found)
      * [Unsuccessful event message ( No event gateway token )](#unsuccessful-event-message--no-event-gateway-token-)
      * [Successful event message being sent to Alexa](#successful-event-message-being-sent-to-alexa)
   * [[Alexa] ERROR:  Event gateway token refresh error: 400](#alexa-error--event-gateway-token-refresh-error-400)
<!--te-->

# Initial Setup


## [Alexa] ERROR: ( homebridge-alexa) Login to homebridge.ca failed, please validate your credentials in config.json and restart homebridge.

### - Bad login or password in your config.json for https://www.homebridge.ca

## [Alexa] ERROR: ( homebridge-alexa) You have an issue with your installation, please review the README.

This message is triggered when the plugin repeatably has an issue connecting to the homebridge.ca cloud server. After 5 connection failures this message appears.

Known possible causes:

### - Cloud Server DDOS Protection has blocked your IP address

If the cloud server detects multiple connection attempts from your IP address in a short period of time, the cloud service will prevent access from your IP Address for a few minutes.  To recover from this condition you need to stop the plugin for 5 minutes, then start it again.  Easiest method of clearing the issue is to turn off your RPI for 5 minutes, then turn it on again.

### - Multiple copies of homebridge-alexa on your network
### - VPN Software interfering with homebridge-alexa to homebridge.ca communications

Please note, this message appears every 5 times the skill needs to reconnect to the skill cloud backend, so the message may occasionally appear.

## [Alexa] ERROR: ( homebridge-alexa) Stopping Home Skill connection due to excessive reconnects, please review the README.

Due to configuration or other issues

## [Alexa] WARNING: Duplicate device name xxxxx

Some of your devices have duplicate names, and will need to be edited and the Alexa App before using.

# Initial Setup Messages from DEBUG mode

## alexaHAP HAP Discover failed ... is not running in insecure mode

```
alexaHAP HAP Discover failed Bart-Dev http://192.168.1.231:51826 homebridge is not running in insecure mode with -I
```

Your homebridge instance is running without the -I option set.

## HAP Discover failed ..... error code 470

These are other HomeKit devices on your network, that are not compatible with homebridge-alexa.  These errors can be ignored.

```
alexaHAP HAP Discover failed Philips hue - 6C4C68 http://192.168.2.38:8080 error code 470 +282ms
alexaHAP HAP Discover failed iDevices Switch http://192.168.2.2:80 error code 470 +61ms
```

## Upgraded from old version and am seeing this error message

```
Mär 10 19:01:49 homebridge homebridge[8313]: /usr/local/lib/node_modules/homebridge/node_modules/hap-nodejs/lib/util/ssdp.js:216
Mär 10 19:01:49 homebridge homebridge[8313]: return (config.username)
Mär 10 19:01:49 homebridge homebridge[8313]: ^
Mär 10 19:01:49 homebridge homebridge[8313]: TypeError: Cannot read property 'username' of undefined
Mär 10 19:01:49 homebridge homebridge[8313]: at Object.getHueBridgeMac (/usr/local/lib/node_modules/homebridge/node_modules/hap-nodejs/lib/util/ssdp.js:216:20)
Mär 10 19:01:49 homebridge homebridge[8313]: at _getUniqueid (/usr/local/lib/node_modules/homebridge/node_modules/hap-nodejs/lib/util/hue.js:373:20)
```

If you have upgraded from the non-skill version to the skill based version you need to tell Alexa to forget all your old devices.

## [Alexa] ERROR: HAP Discovery failed, please review config

Possible causes:

1 - Discovery of your homebridge instances failed, please confirm that you have added the -I to the homebridge command line.

2 - Discovery is working, but you don't have any devices that are supported by homebridge-alexa.


## alexaLocal ERROR: connect ECONNREFUSED 35.169.132.61:1883 ->  ECONNREFUSED

Cloud Server DDOS Protection has blocked your IP address

If the cloud server detects multiple connection attempts from your IP address in a short period of time, the cloud service will prevent access from your IP Address for a few minutes.  To recover from this condition you need to stop the plugin for 5 minutes, then start it again.  Easiest method of clearing the issue is to turn off your RPI for 5 minutes, then turn it on again.

## alexaLocal error { Error: connect ECONNREFUSED 35.169.132.61:8883

When message has port 8883, this error is a future expansion option, and can be ignored

```
alexaLocal error { Error: connect ECONNREFUSED 35.169.132.61:8883
at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1191:14)
errno: 'ECONNREFUSED',
code: 'ECONNREFUSED',
syscall: 'connect',
address: '35.169.132.61',
port: 8883 } +179ms
alexaLocal offline +8ms
```

This is for a future feature enhancement, and can be ignored.

# Device Discovery

## Device discovery fails and the plugin logs show no issues.

1 - Using just the website/app without an Alexa device does not work.

2 - If device discovery is not working, and you have no errors.  Trying relinking the skill in the Alexa App.  To relink the skill, first 'Disable Skill', then 'Enable' skill.

In the plugin debug logs, when a discovery request is received by the plugin it looks like this

```
[2018-3-12 19:10:33] [Alexa] alexaDiscovery - returned 36 devices
```

## Device discovery fails, and this message is in the logs `ERROR: Empty accessory name, parsing failed.`

Alexa requires each accessory to have a name, please update your plugin config so that every accessory has a name.

## Device discovery fails, and this message is in the logs `ERROR: Maximum devices/accessories of 300 exceeded.`

Amazon only supports a maximum of 300 devices per skill.  Please see further details here https://developer.amazon.com/docs/device-apis/alexa-discovery.html#response


## Device discovery fails, and this message is in the logs `ERROR: Parsing failed, duplicate endpointID.`

The likely cause of this error is a duplicate accessory name.  Please adjust your devices names in your plugins config.json.

## After restarting homebridge Alexa can't find devices and needs to discover them again.  Or you have duplicate devices in Alexa

Homebridge-Alexa needs to have a consistent port number for homebridge, please ensure your config.json for each homebridge instance contains a port number.

# Controlling devices

## [Alexa] PowerController TurnOff 192.168.1.226 51826 undefined Error: Homebridge auth failed, invalid PIN

Your homebridge access pin is incorrect, please set the PIN as part of the config.  See here

https://github.com/NorthernMan54/homebridge-alexa#optional-parameters

# Event error messages

##  [Alexa] WARNING: ( homebridge-alexa) Dropped event message, message rate too high.

Events from your contact or motion sensors are sending updates faster than the Alexa backend can handle.  Maximum rate is 1 message every 10 seconds, any faster and the messages will be dropped and forwarded to Alexa.

## ERROR:  Error: getAccessToken No data Error: XXXXXXXXXX
## ERROR:  Error: getAccessToken Token not found

This occurs if your homebridge-alexa account is not enabled to send events. To enable your account for events, please disable the Alexa Homebridge skill and enable the skill again.  This will register your account for events.

If your homebridge-alexa account was created after Feb 15, 2019, and your receiving this message, please raise an issue.

### Unsuccessful event message ( No event gateway token )

```
Feb 16 13:19:44 raj homebridge[2088]: 2019-02-16T18:19:44.123Z alexaActions Event {"host":"192.168.1.253","port":51826,"aid":13,"iid":16,"status":false}
Feb 16 13:19:44 raj homebridge[2088]: 2019-02-16T18:19:44.125Z alexaLocal Sending message {"context":{},"event":{"header":{"messageId":"e53c5dd3-b8a8-45e8-bb9a-b7f78e474baf","namespace":"Alexa","name":"ChangeReport","payloadVersion":"3"},"endpoint":{"endpointId":"Q0M6MjI6M0Q6RTM6Q0Y6MzItUmFqLVdTU0VOU09SLVBvcmNoIE1vdGlvbi0wMDAwMDA4NS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE="},"payload":{"change":{"cause":{"type":"PHYSICAL_INTERACTION"},"properties":[{"namespace":"Alexa.MotionSensor","name":"detectionState","value":"NOT_DETECTED","timeOfSample":"2019-02-16T18:19:44.123Z","uncertaintyInMilliseconds":500}]}}}}
Feb 16 13:19:46 raj homebridge[2088]: 2019-02-16T18:19:46.177Z alexaLocal Emitting System
Feb 16 13:19:46 raj homebridge[2088]: [2/16/2019, 1:19:46 PM] [Alexa] ERROR:  Error: getAccessToken No data Error: Northern.Man54
```

### Successful event message being sent to Alexa

This is from my homebridge-wssensor plugin YMMV

```
Feb 16 14:29:05 raj homebridge[2088]: Sat, 16 Feb 2019 19:29:05 GMT websocket on.message: ::ffff:192.168.1.13 { "Hostname": "NODE-2BA0FF", "Model": "BME-MS", "Version": "2.0", "Firmware": "2.1.0", "Data": { "Temperature": -1.68, "Humidity": 60.978, "Moisture": 0, "Status": 0, "Barometer": 998.206, "Dew": -8.22, "Motion": 1, "MotionStatus": 0  }}
Feb 16 14:29:05 raj homebridge[2088]: Sat, 16 Feb 2019 19:29:05 GMT EventedHTTPServer [::ffff:192.168.1.65] Sending HTTP event '13.10' with data: {"characteristics":[{"aid":13,"iid":10,"value":-1.6}]}
Feb 16 14:29:05 raj homebridge[2088]: Sat, 16 Feb 2019 19:29:05 GMT EventedHTTPServer [::ffff:192.168.1.253] Sending HTTP event '13.16' with data: {"characteristics":[{"aid":13,"iid":16,"value":true}]}
Feb 16 14:29:05 raj homebridge[2088]: Sat, 16 Feb 2019 19:29:05 GMT EventedHTTPServer [::ffff:192.168.1.65] Sending HTTP event '13.16' with data: {"characteristics":[{"aid":13,"iid":16,"value":true}]}
Feb 16 14:29:05 raj homebridge[2088]: Sat, 16 Feb 2019 19:29:05 GMT EventedHTTPServer [::ffff:192.168.1.70] Sending HTTP event '13.16' with data: {"characteristics":[{"aid":13,"iid":16,"value":true}]}
Feb 16 14:29:05 raj homebridge[2088]: Sat, 16 Feb 2019 19:29:05 GMT EventedHTTPServer [fe80::cd6:6862:b69f:44d2] Sending HTTP event '13.16' with data: {"characteristics":[{"aid":13,"iid":16,"value":true}]}
Feb 16 14:29:05 raj homebridge[2088]: 2019-02-16T19:29:05.098Z hapClient Event { host: '192.168.1.253',
Feb 16 14:29:05 raj homebridge[2088]: port: 51826,
Feb 16 14:29:05 raj homebridge[2088]: aid: 13,
Feb 16 14:29:05 raj homebridge[2088]: iid: 16,
Feb 16 14:29:05 raj homebridge[2088]: status: true }
Feb 16 14:29:05 raj homebridge[2088]: 2019-02-16T19:29:05.101Z alexaActions Event {"host":"192.168.1.253","port":51826,"aid":13,"iid":16,"status":true}
Feb 16 14:29:05 raj homebridge[2088]: 2019-02-16T19:29:05.107Z alexaLocal Sending message {"context":{},"event":{"header":{"messageId":"6efb7ccb-1720-4f79-9552-9c27f9b27bec","namespace":"Alexa","name":"ChangeReport","payloadVersion":"3"},"endpoint":{"endpointId":"Q0M6MjI6M0Q6RTM6Q0Y6MzItUmFqLVdTU0VOU09SLVBvcmNoIE1vdGlvbi0wMDAwMDA4NS0wMDAwLTEwMDAtODAwMC0wMDI2QkI3NjUyOTE="},"payload":{"change":{"cause":{"type":"PHYSICAL_INTERACTION"},"properties":[{"namespace":"Alexa.MotionSensor","name":"detectionState","value":"DETECTED","timeOfSample":"2019-02-16T19:29:05.103Z","uncertaintyInMilliseconds":500}]}}}}
```

## [Alexa] ERROR:  Event gateway token refresh error: 400

Your event gateway authorization needs a manual refresh, this is required in order to utilize events from Motion and Contact sensors in routines.  In the Amazon Alexa app, please "Disable Skill" and "Enable" the skill, and re-enter your password.
