**Troubleshooting Tips**

<!--ts-->
   * [ERROR: ( homebridge-alexa) You have an issue with your installation, please review the README](#error--homebridge-alexa-you-have-an-issue-with-your-installation-please-review-the-readme)
   * [alexaLocal error { Error: Connection refused: Not authorized](#alexalocal-error--error-connection-refused-not-authorized)
   * [ERROR: ( homebridge-alexa) Stopping Home Skill connection due to excessive reconnects, please review the README.](#error--homebridge-alexa-stopping-home-skill-connection-due-to-excessive-reconnects-please-review-the-readme)
   * [[Alexa] PowerController TurnOff 192.168.1.226 51826 undefined Error: Homebridge auth failed, invalid PIN](#alexa-powercontroller-turnoff-1921681226-51826-undefined-error-homebridge-auth-failed-invalid-pin)
   * [alexaHAP HAP Discover failed ... is not running in insecure mode](#alexahap-hap-discover-failed--is-not-running-in-insecure-mode)
      * [HAP Discover failed ..... error code 470](#hap-discover-failed--error-code-470)
   * [Upgraded from old version and am seeing this error message](#upgraded-from-old-version-and-am-seeing-this-error-message)
   * [[Alexa] ERROR: HAP Discovery failed, please review config](#alexa-error-hap-discovery-failed-please-review-config)
   * [After restarting homebridge Alexa can't find devices and needs to discover them again.  Or you have duplicate devices in Alexa](#after-restarting-homebridge-alexa-cant-find-devices-and-needs-to-discover-them-again--or-you-have-duplicate-devices-in-alexa)
   * [Device discovery fails and the plugin logs show no issues.](#device-discovery-fails-and-the-plugin-logs-show-no-issues)
   * [This connection refused message for port 8883 is not an error, and can be ignored](#this-connection-refused-message-for-port-8883-is-not-an-error-and-can-be-ignored)

<!-- Added by: sgracey, at:  -->

<!--te-->

# ERROR: ( homebridge-alexa) You have an issue with your installation, please review the README

Likely cause of this message is having multiple copies of homebridge-alexa in your environment or bad login/password in the config.json.  Please note your only need one installation of homebridge-alexa per home or network.

# alexaLocal error { Error: Connection refused: Not authorized

Not authorized, the username and/or password configured in the plugin is incorrect.

# ERROR: ( homebridge-alexa) Stopping Home Skill connection due to excessive reconnects, please review the README.

The homebridge-alexa plugin is having issues maintaining a connection to homebridge.cloudwatch.net, most likely cause of this message is having multiple copies of homebridge-alexa in your environment.  The plugin has stopped responding to Alexa commands until the issue is resolved.

# [Alexa] PowerController TurnOff 192.168.1.226 51826 undefined Error: Homebridge auth failed, invalid PIN

Your homebridge access pin is incorrect, please set the PIN as part of the config.  See here

https://github.com/NorthernMan54/homebridge-alexa#optional-parameters

# alexaHAP HAP Discover failed ... is not running in insecure mode

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

# Upgraded from old version and am seeing this error message

```
Mär 10 19:01:49 homebridge homebridge[8313]: /usr/local/lib/node_modules/homebridge/node_modules/hap-nodejs/lib/util/ssdp.js:216
Mär 10 19:01:49 homebridge homebridge[8313]: return (config.username)
Mär 10 19:01:49 homebridge homebridge[8313]: ^
Mär 10 19:01:49 homebridge homebridge[8313]: TypeError: Cannot read property 'username' of undefined
Mär 10 19:01:49 homebridge homebridge[8313]: at Object.getHueBridgeMac (/usr/local/lib/node_modules/homebridge/node_modules/hap-nodejs/lib/util/ssdp.js:216:20)
Mär 10 19:01:49 homebridge homebridge[8313]: at _getUniqueid (/usr/local/lib/node_modules/homebridge/node_modules/hap-nodejs/lib/util/hue.js:373:20)
```

If you have upgraded from the non-skill version to the skill based version you need to tell Alexa to forget all your old devices.

# [Alexa] ERROR: HAP Discovery failed, please review config

Possible causes:

1 - Discovery of your homebridge instances failed, please confirm that you have added the -I to the homebridge command line.

2 - Discovery is working, but you don't have any devices that are supported by homebridge-alexa.

# After restarting homebridge Alexa can't find devices and needs to discover them again.  Or you have duplicate devices in Alexa

Homebridge-Alexa needs to have a consistent port number for homebridge, please ensure your config.json for each homebridge instance contains a port number.

# Device discovery fails and the plugin logs show no issues.

Using just the website/app without an Alexa device does not work.

# This connection refused message for port 8883 is not an error, and can be ignored

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
