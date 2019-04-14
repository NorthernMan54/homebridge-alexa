**Troubleshooting Tips**

<!--ts-->
   * [Initial setup](#initial-setup)
      * [ERROR: ( homebridge-alexa) You have an issue with your installation, please review the README](#error--homebridge-alexa-you-have-an-issue-with-your-installation-please-review-the-readme)
      * [alexaLocal error { Error: Connection refused: Not authorized](#alexalocal-error--error-connection-refused-not-authorized)
      * [ERROR: ( homebridge-alexa) Stopping Home Skill connection due to excessive reconnects, please review the README.](#error--homebridge-alexa-stopping-home-skill-connection-due-to-excessive-reconnects-please-review-the-readme)
      * [alexaHAP HAP Discover failed ... is not running in insecure mode](#alexahap-hap-discover-failed--is-not-running-in-insecure-mode)
      * [HAP Discover failed ..... error code 470](#hap-discover-failed--error-code-470)
      * [Upgraded from old version and am seeing this error message](#upgraded-from-old-version-and-am-seeing-this-error-message)
      * [[Alexa] ERROR: HAP Discovery failed, please review config](#alexa-error-hap-discovery-failed-please-review-config)
      * [After restarting homebridge Alexa can't find devices and needs to discover them again.  Or you have duplicate devices in Alexa](#after-restarting-homebridge-alexa-cant-find-devices-and-needs-to-discover-them-again--or-you-have-duplicate-devices-in-alexa)
      * [alexaLocal error { Error: connect ECONNREFUSED 35.169.132.61:8883](#alexalocal-error--error-connect-econnrefused-35169132618883)
      * [Intermittent connectivity from Alexa to Homebridge](#intermittent-connectivity-from-alexa-to-homebridge)
   * [Device Discovery](#device-discovery)
      * [Device discovery fails and the plugin logs show no issues.](#device-discovery-fails-and-the-plugin-logs-show-no-issues)
   * [Controlling devices](#controlling-devices)
      * [[Alexa] PowerController TurnOff 192.168.1.226 51826 undefined Error: Homebridge auth failed, invalid PIN](#alexa-powercontroller-turnoff-1921681226-51826-undefined-error-homebridge-auth-failed-invalid-pin)
   * [Event error messages](#event-error-messages)
      * [ERROR:  Error: getAccessToken No data Error: XXXXXXXXXX](#error--error-getaccesstoken-no-data-error-xxxxxxxxxx)
      * [ERROR:  Error: getAccessToken Token not found](#error--error-getaccesstoken-token-not-found)
         * [Unsuccessful event message ( No event gateway token )](#unsuccessful-event-message--no-event-gateway-token-)
         * [Successful event message being sent to Alexa](#successful-event-message-being-sent-to-alexa)
      * [[Alexa] ERROR:  Event gateway token refresh error: 400](#alexa-error--event-gateway-token-refresh-error-400)

<!-- Added by: sgracey, at:  -->

<!--te-->

# Initial setup

## ERROR: ( homebridge-alexa) You have an issue with your installation, please review the README

Likely cause of this message is having multiple copies of homebridge-alexa in your environment or bad login/password in the config.json.  Please note your only need one installation of homebridge-alexa per home or network.

Known possible causes:

1 - Multiple copies of homebridge-alexa on your network
2 - Bad login or password in your config.json for https://www.homebridge.ca
3 - VPN Software interfering with homebridge-alexa to Alexa communications

Please note, this message appears every 5 times the skill needs to reconnect to the skill cloud backend, so the message may occasionally appear.

## alexaLocal error { Error: Connection refused: Not authorized

Not authorized, the username and/or password configured in the plugin is incorrect.

## ERROR: ( homebridge-alexa) Stopping Home Skill connection due to excessive reconnects, please review the README.

The homebridge-alexa plugin is having issues maintaining a connection to homebridge.cloudwatch.net, most likely cause of this message is having multiple copies of homebridge-alexa in your environment.  The plugin has stopped responding to Alexa commands until the issue is resolved.

Please note, this message appears after the skill needs to reconnect to the skill cloud backend over 1,000 times.  As this point the plugin has stopped trying to connect to the skill cloud backend.  Restarting homebridge will reset the counter.

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

## After restarting homebridge Alexa can't find devices and needs to discover them again.  Or you have duplicate devices in Alexa

Homebridge-Alexa needs to have a consistent port number for homebridge, please ensure your config.json for each homebridge instance contains a port number.

## alexaLocal error { Error: connect ECONNREFUSED 35.169.132.61:8883

This error is a future expansion option, and can be ignored

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

## Intermittent connectivity from Alexa to Homebridge

Alexa works intermittently, and the logs have offline/reconnect messages.  Also in your environment your running VPN software on the same machine as homebridge.  The VPN software is interfering with the MQTT connection between homebridge-alexa and https://www.homebridge.ca.  Please move the VPN to a different machine.

```
alexaLocal offline +35s
alexaLocal reconnect +5s
```

# Device Discovery

## Device discovery fails and the plugin logs show no issues.

1 - Using just the website/app without an Alexa device does not work.

2 - If device discovery is not working, and you have no errors.  Trying relinking the skill in the Alexa App.  To relink the skill, first 'Disable Skill', then 'Enable' skill.

In the plugin debug logs, when a discovery request is received by the plugin it looks like this

```
alexaLocal Emitting alexa.discovery
[2018-3-12 19:10:33] [Alexa] alexaDiscovery - returned 36 devices
```

# Controlling devices

## [Alexa] PowerController TurnOff 192.168.1.226 51826 undefined Error: Homebridge auth failed, invalid PIN

Your homebridge access pin is incorrect, please set the PIN as part of the config.  See here

https://github.com/NorthernMan54/homebridge-alexa#optional-parameters

# Event error messages

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

Your event gateway authorization needs a manual refresh.  In the Amazon Alexa app, please "Disable Skill" and "Enable" the skill.
