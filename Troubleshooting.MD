# Troubleshooting Tips

### alexaHAP HAP Discover failed Homebridge http://undefined:51826 error ENOTFOUND +857ms

Check your hostname for your raspberrypi, it may be already in use.

### ERROR: ( homebridge-alexa) You have an issue with your installation, please review the README

Likely cause of this message is having multiple copies of homebridge-alexa in your environment.  Please note your only need one per home or network.

### [2018-3-7 19:55:31] [Alexa] PowerController TurnOff 192.168.1.226 51826 undefined Error: Homebridge auth failed, invalid PIN

Your homebridge access pin is incorrect

###   alexaHAP HAP Discover failed Bart-Dev http://192.168.1.231:51826 homebridge is not running in insecure mode with -I +6ms

Your homebridge instance is running without the -I option set.

###  alexaHAP HAP Discover failed Homebridge http://undefined:51826 error ENOTFOUND +22ms

Please check that the hostname of your RPI is set properly and not duplicated with other RPI's on your network.

### Upgraded from old version and am seeing this error message

```Mär 10 19:01:49 homebridge homebridge[8313]: /usr/local/lib/node_modules/homebridge/node_modules/hap-nodejs/lib/util/ssdp.js:216
Mär 10 19:01:49 homebridge homebridge[8313]: return (config.username)
Mär 10 19:01:49 homebridge homebridge[8313]: ^
Mär 10 19:01:49 homebridge homebridge[8313]: TypeError: Cannot read property 'username' of undefined
Mär 10 19:01:49 homebridge homebridge[8313]: at Object.getHueBridgeMac (/usr/local/lib/node_modules/homebridge/node_modules/hap-nodejs/lib/util/ssdp.js:216:20)
Mär 10 19:01:49 homebridge homebridge[8313]: at _getUniqueid (/usr/local/lib/node_modules/homebridge/node_modules/hap-nodejs/lib/util/hue.js:373:20)```

If you have upgraded from the non-skill version to the skill based version you need to tell Alexa to forget all your old devices.
