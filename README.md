**homebridge-alexa** Version 2 - Home Skill Based

[![NPM Downloads](https://img.shields.io/npm/dm/homebridge-alexa.svg?style=flat)](https://npmjs.org/package/homebridge-alexa)

![Icon](https://github.com/NorthernMan54/alexaAwsBackend/blob/master/skillPublish/homebridge-alexa-108.png?raw=true)

Enable Amazon Alexa access to you homebridge controlled devices and accessories.  Full support for all Amazon Alexa devices, including the echo 2nd Generation and software based solutions.  Uses an Amazon smart home skill based approach for integration between HomeBridge and Amazon Alexa.  ( I have stopped using my previous version based on a custom version of HomeBridge, as Amazon is no longer supporting the integration interface I was using on newer Alexa devices, like the Echo 2nd generation. )

Country availability - The plugin is available in these countries, English (AU), German (DE), English (CA), English (US), French (FR), English (UK).  In the near future I will be adding Italian (IT), English (IN), Spanish (ES), Japanese (JP), and Spanish (MX).  ~~If you want early access, contact me thru slack, and I can add yourself to the BETA test.~~

**Nov 2 - I have just submitted the skill for certification in Italian (IT), English (IN),  Spanish (ES), Japanese (JP), and Spanish (MX). This should take 5-7 days, fingers crossed.**

**Nov 9 - I just received an email back from Amazon, and they are saying that they have a large number of skills to review, and need a few more days.  Stay tuned.**

* Supports multiple homebridge instances running on your network.
* Auto-discovery of multiple Homebridge's
* Supports devices of homekit Service type Lightbulb, Outlet, Fan, Fan2, Temperature Sensor, Window Coverings and Switch.
* Includes support for brightness and colour.
* This plugin does not have any devices or accessories that are visible from Homekit, and does not need to be added on the Home app.
* The plugin does not need to be installed in your 'main' homebridge instance.  It can be installed in any 'Homebridge' instance in your setup
* Enables control from non-hardware based alexa devices like Invoxia Triby, and AlexaPI.

# Table of Contents
<!--ts-->
   * [Table of Contents](#table-of-contents)
   * [New features with Version 2](#new-features-with-version-2)
      * [HomeKit/Homebridge Devices supported](#homekithomebridge-devices-supported)
      * [Voice commands supported](#voice-commands-supported)
      * [Color temperature](#color-temperature)
         * [Color Temperatures](#color-temperatures)
      * [AppleTV](#appletv)
      * [Speakers](#speakers)
      * [Yamaha Receiver/Spotify control](#yamaha-receiverspotify-control)
      * [Unsupported device types](#unsupported-device-types)
   * [Installation of homebridge-alexa](#installation-of-homebridge-alexa)
      * [Upgrading from the previous, non skill based version of homebridge-alexa](#upgrading-from-the-previous-non-skill-based-version-of-homebridge-alexa)
      * [config.json](#configjson)
         * [Required parameters](#required-parameters)
         * [Optional parameters](#optional-parameters)
   * [Issues, Questions or Problems](#issues-questions-or-problems)
      * [Known Issues](#known-issues)
   * [Previous version of homebridge-alexa ( Version 1 )](#previous-version-of-homebridge-alexa--version-1-)
   * [Roadmap](#roadmap)
   * [Credits](#credits)

<!-- Added by: sgracey, at:  -->

<!--te-->

# New features with Version 2

* Support for color bulbs
* Support for Window coverings/blinds ( As Alexa doesn't support window coverings I'm using a light bulb)
* Support for Garage Doors ( As Alexa doesn't support Garage Doors I'm using a light bulb)
* Support for Temperature Sensors
* Support for Fan2 aka Dyson fans
* Support for Valves, Sprinklers and Shower Heads
* Support for more than 100 accessories
* Support for generation 2 Echo's and other Alexa devices not supported with the original version
* Support for the color temperature of white bulbs
* Support for Speakers ( Tested with homebridge-yamaha-home and homebridge-http-irblaster )
* Support for Apple TV ( Supports homebridge-apple-tv )
* Support Spotify playback controls via homebridge-yamaha-home

Alexa device names are the same as the homebridge device names.

This only supports accessories connected via a homebridge plugin, any 'Homekit' accessories are not supported, and will never be supported.

## HomeKit/Homebridge Devices supported

Native Support

* Lightbulbs, outlets and switches
* Dimmable lightbulbs, outlets and switches
* Colour lightbulbs
* Speakers
* Apple TV
* Temperature Sensors
* Thermostat - Partial support only ( Set target Temperature in celsius )

Emulating a Light bulb

* Fans - Supported as a light bulb
* Garage Door - Supported as light bulb
* Valves, Sprinklers and Shower Heads - Supported as a light bulb

## Voice commands supported

* Alexa, discover devices
* Alexa, turn on  *device*
* Alexa, turn off  *device*
* Alexa, set *device* to 50
* Alexa, what is the temperature in the  *device*
* Alexa, dim *device*
* Alexa, brighten *device*
* Alexa, turn *device* red
* Alexa, turn on *device* ( Open's a garage door )
* Alexa, turn off *device* ( Close's a garage door )

## Color temperature

* Alexa, set/make the *device* cooler/whiter ( Color temperature )
* Alexa, set/make the *device* warmer/softer ( Color temperature )
* Alexa, make the *device* warm white ( Color temperature )

### Color Temperatures ###

```
warm, warm white
incandescent, soft white
white
daylight, daylight white
cool, cool white
```

## AppleTV

* Alexa, pause *device* ( Apple TV )
* Alexa, resume *device* ( Apple TV )
* Alexa, play *device* ( Apple TV )
* Alexa, stop *device* ( Apple TV )

## Speakers

* Alexa, lower the volume on *device*
* Alexa, volume up 20 on *device* ( Speakers )
* Alexa, set the volume of *device* to 50 ( Speakers )

## Yamaha Receiver/Spotify control

* Alexa, pause Stereo
* Alexa, resume Stereo
* Alexa, stop Stereo
* Alexa, next song on Stereo
* Alexa, rewind on Stereo

## Unsupported device types

* Thermostats
* Camera's ( for use with an Alexa show etc )
* Eve devices

# Installation of homebridge-alexa

**Plugin Installation**

The setup of the plugin is very straight forward, and requires enabling insecure mode of each homebridge instance you want to control from Alexa.

1. All homebridge instances that you want to control from Alexa need to run in insecure mode with -I included on the command line.  How you make this change will depend on your installation of homebridge, and how you start homebridge.  If you start from the command line, it would look like this:

```
homebridge -I
```

If your using systemd to manage homebridge, the -I is added to the file /etc/default/homebridge in the line, HOMEBRIDGE_OPTS ie.

```
# Defaults / Configuration options for homebridge
# The following settings tells homebridge where to find the config.json file and where to persist the data (i.e. pairing and others)
HOMEBRIDGE_OPTS=-I

# If you uncomment the following line, homebridge will log more
# You can display this via systemd's journalctl: journalctl -f -u homebridge
#DEBUG=
```

If you have multiple homebridge options, the -I should be listed first. ie

```
HOMEBRIDGE_OPTS=-I -U /var/homebridge
```

2. The setup of homebridge-alexa is similar to other plugins, except it doesn't have any devices in the Home app;-)  I'm just reusing the runtime and configuration file management. And it only needs to installed once if you have multiple homeridge's installed.  It will auto-discover and connect to the other instances.

```
sudo npm install -g homebridge-alexa
```

**Alexa Home Skill configuration**

3. An account to link your Amazon Alexa to HomeBridge needs to created on this website https://homebridge.cloudwatch.net.  This account will be used when you enable the home skill in the Alexa App on your mobile, and in the configuration of the plugin in homebridge.

4. Search for the homebridge skill on the Alexa App/Web site, and link you Amazon account to the account you created above.

**HomeBridge-alexa plugin configuration**

5. Add the plugin to your config.json.  The login and password in the config.json, are the credentials you created earlier for the https://homebridge.cloudwatch.net website.  This only needs to be completed for one instance of homebridge in your environment, it will discover the accessories connected to your other homebridges automatically.

```
"platforms": [
  {
    "platform": "Alexa",
    "name": "Alexa",
    "username": "....",
    "password": "....",
    "pin": "031-45-155",
    "refresh": 15
  }
],
```

* pin and refresh are optional parameters, details are below

5.1 Optional parameters

* speakers - Devices to configure as speakers

```
"platforms": [
  {
    "platform": "Alexa",
    "name": "Alexa",
    "username": "....",
    "password": "....",
    "speakers": [{
        "manufacturer": "...",
        "name": "..."
    }]
  }
],
```

** Manufacturer - Is the manufacturer of the accessory as shown in the Home App

** Name - Is the name of the accessory as shown in the Home App

ie
```
{
    "platform": "Alexa",
    "username": "...",
    "password": "...",
    "name": "Alexa",
    "speakers": [{
        "manufacturer": "Yamaha",
        "name": "Front"
      },
      {
        "manufacturer": "Yamaha",
        "name": "Rear"
      },
      {
        "manufacturer": "HTTP-IRBlaster",
        "name": "Panasonic"
      }
    ]
  }
```

* Apple TV

This is the config from my Apple TV after completing the pairing.  Please note, *"showDefaultSwitches": true* and   *"defaultSwitchesIncludeATVName": true*, are required parameters.  Please note I blanked out the devices/credentials section with my ATV credentials.

```
{
  "platform":"AppleTV",
  "name":"Apple TV",
  "devices": [{
          "id": "Cottage",
          "name": "TV",
          "credentials": "...." }
    ],
  "showDefaultSwitches": true,
  "defaultSwitchesIncludeATVName": true,
  "showPairSwitches": false,
  "hideWelcomeMessage": true
}
```

* Yamaha Spotify Controls

This uses the plugin homebridge-yamaha-home and a Yamaha Receiver which includes Spotify and Spotify Playback Controls.

**Testing and confirming configuration**

6. Start homebridge in DEBUG mode, to ensure configuration of homebridge-alexa is correct.  This will need to be executed with your implementations configuration options and as the same user as you are running homebridge. If you are homebridge with an autostart script ie systemd, you will need to stop the autostart temporarily.

ie
```
DEBUG=alexa* homebridge -I
```

7. Please ensure that homebridge starts without errors, and output should be similar to this.  This is from my setup, and I have several instances of homebridge so you may have a different number of alexaHAP lines.

```
alexaHAP Starting Homebridge instance discovery +0ms
alexaLocal Connecting to Homebridge Smart Home Skill +1ms
[2018-3-17 11:23:57] Homebridge is running on port 51826.
alexaHAP HAP Device discovered Porch Camera [ '192.168.1.226' ] +87ms
alexaHAP HAP instance address: Porch Camera -> howard.local -> 192.168.1.226 +1ms
alexaHAP HAP Device discovered Howard [ '192.168.1.226' ] +4ms
alexaHAP HAP instance address: Howard -> howard.local -> 192.168.1.226 +0ms
alexaHAP HAP Device discovered Howard-Hue [ '192.168.1.226' ] +0ms
alexaHAP HAP instance address: Howard-Hue -> howard.local -> 192.168.1.226 +0ms
alexaHAP HAP Device discovered Spare Camera [ '192.168.1.226' ] +1ms
alexaHAP HAP instance address: Spare Camera -> howard.local -> 192.168.1.226 +0ms
alexaLocal offline +5ms
alexaHAP HAP Device discovered Penny [ 'fe80::ba27:ebff:febf:bbaa', '192.168.1.4', '169.254.185.85' ] +42ms
alexaHAP HAP instance address: Penny -> penny.local -> 192.168.1.4 +0ms
alexaHAP Homebridge instance discovered Howard with 12 accessories +7ms
alexaHAP Homebridge instance discovered Porch Camera with 1 accessories +11ms
alexaHAP Homebridge instance discovered Howard-Hue with 5 accessories +1ms
alexaHAP Homebridge instance discovered Spare Camera with 1 accessories +10ms
alexaHAP Homebridge instance discovered Penny with 26 accessories +101ms
alexaHAP HAP Device discovered Bart-Dev [ 'fe80::1c05:2c:5ae4:abdc', '192.168.1.231' ] +662ms
alexaHAP HAP instance address: Bart-Dev -> Bart.local -> 192.168.1.231 +0ms
alexaHAP Homebridge instance discovered Bart-Dev with 1 accessories +7ms
alexaLocal reconnect +4s
alexaLocal connect command/northernMan/# +174ms
```

Please note, that if you have other HomeKit devices on your network, like Philip's hue hub's, they will generate a `HAP Discover failed` message that can be ignored.

8. At this point you are ready to have Alexa discover devices.  Once you say Alexa, discover devices, the output will get very verbose for a minute.  After discovery is complete you should see a line showing the number of devices returned to Alexa.

ie

```
.
.
.
alexaTranslator Alexa Controllable Penny 22 +1ms
alexaTranslator Alexa Controllable Bart-Dev 0 +0ms
[2018-3-17 11:01:03] [Alexa] alexaDiscovery - returned 36 devices
```

In the event you have errors, or no devices returned please review your config.

Please note, as part of the verbose output from discovery devices, all your devices with the Alexa voice commands for each accessory are output in CSV format.  You could grab these, format them into something usable and share.

9. Installation is now complete, good luck and enjoy.

## Upgrading from the previous, non skill based version of homebridge-alexa

If you had installed the previous version of homebridge-alexa with the special version of homebridge and HAP-NodeJS, it can disabled without reinstalling homebridge.  You can disable it by removing the configuration parameter ssdp from your config.json.  This will disable the previous version.

```
"ssdp": 1900
```

Also please have Alexa forget all your old devices.


## config.json

```
"platforms": [
  {
    "platform": "Alexa",
    "name": "Alexa",
    "username": "....",
    "password": "...."
  }
],
```

### Required parameters

* username - Login created for the skill linking website https://homebridge.cloudwatch.net
* password - Login created for the skill linking website https://homebridge.cloudwatch.net

### Optional parameters

* pin - If you had changed your homebridge pin from the default of "pin": "031-45-154" ie

```
"platforms": [
  {
    "platform": "Alexa",
    "name": "Alexa",
    "username": "....",
    "password": "....",
    "pin": "031-45-155"
  }
],
```

* refresh - Frequency of refreshes of the homebridge accessory cache, in seconds.  Defaults to 15 minutes.

```
"platforms": [
  {
    "platform": "Alexa",
    "name": "Alexa",
    "username": "....",
    "password": "....",
    "refresh": 900
  }
],
```

* filter - Limits accessories shared with Alexa to a single homebridge instance.  ( I'm using this setting with Amazon for skill testing. ).  The setting is ip:port of homebridge instance.

```
"platforms": [
  {
    "platform": "Alexa",
    "name": "Alexa",
    "username": "....",
    "password": "....",
    "filter": "192.168.1.122:51826"
  }
],
```

# Issues, Questions or Problems

* I have started recording troubleshooting tips here based on issues seen by the community [Troubleshooting](Troubleshooting.MD).

* I have created a slack channel at (https://homebridgeteam.slack.com/messages/hap-alexa/) to troubleshoot issues not on the troubleshooting page.  If you reach out there, I'm usually available.  If you don't have a slack account and need an invite, one is available via the Homebridge README / Community (https://github.com/nfarina/homebridge#community)

* If you need to log an issue, please include a DEBUG log with your issue.

```
DEBUG=alexa* homebridge -I
```

## Known Issues

* All homebridge PIN's in your setup need to be set to the same value.
* Whitelisting/blacklisting of accessories is not supported, but this can be achieved at the plugin level by putting the plugins you don't want exposed to Alexa in their own instance of HomeBridge, and for that instance of Alexa, don't include -I command line option.  Discovery will fail for that instance, and the accessories will not be exposed.
* An Alexa device is required. Using just the App or Website does not work, and device discovery will fail to find devices.
* Thermostats - Partial support only ( Set target Temperature in celsius )

# Previous version of homebridge-alexa ( Version 1 )

* The old version is still available and the instructions for installation can be found [here.](V1_README.md).

# Roadmap

See [Roadmap](Roadmap.md)

# Credits

* Ben Hardill - For the inspiration behind the design.
* Chrisx9 - German translation
* Tait Brown - HomeSkill Icon
* ozno - Recommendation for the bonjour MDNS implementation, and testing on RPI 0 W
* fazerize - Initial support for Thermostats
