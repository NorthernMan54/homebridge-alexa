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
