# Troubleshooting Tips

### ERROR: ( homebridge-alexa) You have an issue with your installation, please review the README

Likely cause of this message is having multiple copies of homebridge-alexa in your environment or bad login/password in the config.json.  Please note your only need one installation of homebridge-alexa per home or network.

### ERROR: ( homebridge-alexa) Stopping Home Skill connection due to excessive reconnects, please review the README.

The homebridge-alexa plugin is having issues maintaining a connection to homebridge.cloudwatch.net, most likely cause of this message is having multiple copies of homebridge-alexa in your environment.  The plugin has stopped responding to Alexa commands until the issue is resolved.

### [2018-3-7 19:55:31] [Alexa] PowerController TurnOff 192.168.1.226 51826 undefined Error: Homebridge auth failed, invalid PIN

Your homebridge access pin is incorrect, please set the PIN as part of the config.  See here

https://github.com/NorthernMan54/homebridge-alexa#optional-parameters

###   alexaHAP HAP Discover failed Bart-Dev http://192.168.1.231:51826 homebridge is not running in insecure mode with -I +6ms

Your homebridge instance is running without the -I option set.

### Upgraded from old version and am seeing this error message

'''
Mär 10 19:01:49 homebridge homebridge[8313]: /usr/local/lib/node_modules/homebridge/node_modules/hap-nodejs/lib/util/ssdp.js:216
Mär 10 19:01:49 homebridge homebridge[8313]: return (config.username)
Mär 10 19:01:49 homebridge homebridge[8313]: ^
Mär 10 19:01:49 homebridge homebridge[8313]: TypeError: Cannot read property 'username' of undefined
Mär 10 19:01:49 homebridge homebridge[8313]: at Object.getHueBridgeMac (/usr/local/lib/node_modules/homebridge/node_modules/hap-nodejs/lib/util/ssdp.js:216:20)
Mär 10 19:01:49 homebridge homebridge[8313]: at _getUniqueid (/usr/local/lib/node_modules/homebridge/node_modules/hap-nodejs/lib/util/hue.js:373:20)
```

If you have upgraded from the non-skill version to the skill based version you need to tell Alexa to forget all your old devices.

### HAP Discover failed ..... error code 470

These are other HomeKit devices on your network, that are not compatible with homebridge-alexa.  These errors can be ignored.

```
alexaHAP HAP Discover failed Philips hue - 6C4C68 http://192.168.2.38:8080 error code 470 +282ms
alexaHAP HAP Discover failed iDevices Switch http://192.168.2.2:80 error code 470 +61ms
```

### [2018-3-17 10:59:03] [Alexa] ERROR: HAP Discovery failed, please review config

Discovery of your homebridge instances failed, please confirm that you have added the -I to the homebridge command line.

### After restarting homebridge Alexa can't find devices and needs to discover them again.  Or you have duplicate devices in Alexa 

Homebridge-Alexa needs to have a consistent port number for homebridge, please ensure your config.json for each homebridge instance contains a port number.

### Device discovery fails and the plugin logs show no issues.

Using just the website/app without an Alexa device does not work.

### This connection refused message for port 8883 is not error, and be ignored

'''
alexaLocal error { Error: connect ECONNREFUSED 35.169.132.61:8883
at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1191:14)
errno: 'ECONNREFUSED',
code: 'ECONNREFUSED',
syscall: 'connect',
address: '35.169.132.61',
port: 8883 } +179ms
alexaLocal offline +8ms
'''

This is for future feature enhancement, and can be ignored.
