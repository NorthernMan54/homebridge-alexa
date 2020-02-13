**homebridge-alexa** Version 2 - Home Skill Based

[![NPM Downloads](https://img.shields.io/npm/dm/homebridge-alexa.svg?style=flat)](https://npmjs.org/package/homebridge-alexa)

<p align="center">
    <img src="docs/homebridge.png" height="200">
</p>

Enable Amazon Alexa access and control your homebridge controlled devices and accessories.  Full support for all Amazon Alexa devices, including the echo 2nd Generation and software based solutions.  Uses an Amazon smart home skill based approach for integration between HomeBridge and Amazon Alexa.

Country availability - The plugin is available in these countries, English (AU), German (DE), English (CA), English (US), French (FR), English (UK), Italian (IT), English (IN), Spanish (ES), Japanese (JP), Spanish(US), Portuguese (BR) and Spanish (MX).

# Features

* Supports multiple homebridge instances running on your network.
* Auto-discovery of multiple Homebridge's
* Supports the following HomeKit accessory types Lightbulb, Outlet, Fan, Fan2, Temperature Sensor, Window Coverings and Switch.
* Supports passing of sensor updates in real time to Alexa for use in routines.
* Includes support for brightness and colour.
* This plugin does not have any devices or accessories that are visible from Homekit, and does not need to be added on the Home app.
* The plugin does not need to be installed in your 'main' homebridge instance.  It can be installed in any 'Homebridge' instance in your setup.
* Enables control from non-hardware based alexa devices like Invoxia Triby, and AlexaPI.

# Table of Contents
<!--ts-->
   * [Features](#features)
   * [Table of Contents](#table-of-contents)
   * [Supported devices](#supported-devices)
      * [HomeKit/Homebridge Devices supported](#homekithomebridge-devices-supported)
         * [Native Support](#native-support)
         * [Supported as Other Types](#supported-as-other-types)
      * [Unsupported device types](#unsupported-device-types)
   * [Alexa Voice Commands](#alexa-voice-commands)
      * [Setup](#setup)
      * [Light bulbs / Switches / Dimmer Switches](#light-bulbs--switches--dimmer-switches)
      * [Color lights](#color-lights)
      * [Color temperature](#color-temperature)
         * [Color Temperatures](#color-temperatures)
      * [Garage door](#garage-door)
      * [Window coverings / blinds](#window-coverings--blinds)
      * [Thermostat's and Heater / Cooler's](#thermostats-and-heater--coolers)
      * [Lock / Unlock Doors](#lock--unlock-doors)
      * [Temperature sensors](#temperature-sensors)
      * [AppleTV](#appletv)
      * [HomeKit TV (iOS 12.2)](#homekit-tv-ios-122)
         * [HomeKit TV - Tested plugins](#homekit-tv---tested-plugins)
      * [Speakers](#speakers)
         * [Bose SoundLink - Change preset](#bose-soundlink---change-preset)
      * [Yamaha Receiver/Spotify control](#yamaha-receiverspotify-control)
      * [Contact and Motion Sensors](#contact-and-motion-sensors)
   * [Installation of homebridge-alexa](#installation-of-homebridge-alexa)
      * [Prepare Homebridge for plugin installation](#prepare-homebridge-for-plugin-installation)
      * [Install Plugin](#install-plugin)
      * [Create homebridge-alexa account](#create-homebridge-alexa-account)
      * [HomeBridge-alexa plugin configuration](#homebridge-alexa-plugin-configuration)
         * [Required parameters](#required-parameters)
         * [Optional parameters](#optional-parameters)
      * [Initial Testing and confirming configuration](#initial-testing-and-confirming-configuration)
      * [Enable Homebridge smarthome skill and link accounts](#enable-homebridge-smarthome-skill-and-link-accounts)
      * [Discover Devices](#discover-devices)
   * [Service Availability and Issues](#service-availability-and-issues)
      * [Homebridge cloud service monitoring ( homebridge.ca )](#homebridge-cloud-service-monitoring--homebridgeca-)
      * [Raising Issues and Troubleshooting](#raising-issues-and-troubleshooting)
         * [Troubleshooting](#troubleshooting)
         * [Known Issues](#known-issues)
         * [Slack Channel](#slack-channel)
         * [Debug logs](#debug-logs)
         * [Homebridge Accessory Dump](#homebridge-accessory-dump)
   * [Previous version of homebridge-alexa ( Version 1 )](#previous-version-of-homebridge-alexa--version-1-)
      * [Upgrading from the previous, non skill based version of homebridge-alexa](#upgrading-from-the-previous-non-skill-based-version-of-homebridge-alexa)
   * [Roadmap](#roadmap)
   * [Credits](#credits)

<!-- Added by: sgracey, at:  -->

<!--te-->

# Supported devices

* Support for Light Bulbs, Switches and outlets
* Support for Color Light Bulbs and Colour Temperature of white Light bulbs
* Support for Fans (As Alexa doesn't support Fans coverings I'm using Other)
* Support for Window coverings/blinds (As Alexa doesn't support window coverings I'm using Other)
* Support for Garage Doors
* Support for Temperature, Contact and Motion Sensors.  
* Support for Occupancy Sensors as a Contact sensor.  
* Also supports sending real time updates from Contact, Occupancy and Motion sensors to Alexa, for use in routines.
* Support for Fan2 aka Dyson fans
* Support for Valves, Sprinklers and Shower Heads (As Alexa doesn't support these, they are Other)
* Support for more than 100 accessories
* Support for generation 2 Echo's and other Alexa devices not supported with the original version
* Support for Speakers ( Tested with homebridge-yamaha-home, homebridge-soundtouch and homebridge-http-irblaster )
* Support for Apple TV ( Supports homebridge-apple-tv )
* Support Spotify playback controls on Yamaha Receivers via homebridge-yamaha-home
* Support for door locks

Alexa device names are the same as the homebridge device names.

This only supports accessories connected via a homebridge plugin, any 'Homekit' accessories are not supported, and will never be supported.

## HomeKit/Homebridge Devices supported

### Native Support

* Lightbulbs, outlets and switches
* Dimmable lightbulbs, outlets and switches
* Colour lightbulbs
* Speakers
* Apple TV
* Temperature Sensors
* Motion Sensors
* Contact Sensors
* Thermostat
* Heater/Cooler
* Door locks ( Lock and status only, Alexa does not support unlocking )
* HomeKit Television ( Initial support only On/Off and Volume Control )

### Supported as Other Types

* Door/Garage Door - Supported as a on/off device and also supported as a contact sensor for routines
* Fans, Humidifier Dehumidifier and Air Purifiers - Supported as a Switch
* Window Coverings / Blinds - Supported as Other
* Valves, Sprinklers and Shower Heads - Supported as a light bulb
* Occupancy Sensors - Supported as a Contact Sensor

## Unsupported device types

* Camera's ( for use with an Alexa show etc )
* Eve devices
* Security Systems

# Alexa Voice Commands

## Setup

* Alexa, discover devices

## Light bulbs / Switches / Dimmer Switches

* Alexa, turn on *device*
* Alexa, turn off *device*

* Alexa, set *device* to 50
* Alexa, dim *device*
* Alexa, brighten *device*

## Color lights

* Alexa, turn *device* red/green/blue

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

## Garage door

* Alexa, turn on *device* ( Open's a garage door )
* Alexa, turn off *device* ( Close's a garage door )

## Window coverings / blinds

* Alexa, turn on *device* ( Open's blinds )
* Alexa, turn off *device* ( Close's blinds )
* Alexa, set *device* to 50 ( Moves blinds to 50% )

## Thermostat's and Heater / Cooler's

* Alexa, set thermostat to 20
* Alexa, set thermostat to heat/cool/automatic/off

## Lock / Unlock Doors

* Alexa, unlock my *device* ( Amazon is blocking this function )
* Alexa, lock my *device*

## Temperature sensors

* Alexa, what is the temperature in the *device* ( Not supported in Japan )

## AppleTV

* Alexa, pause *device* ( Apple TV )
* Alexa, resume *device* ( Apple TV )
* Alexa, play *device* ( Apple TV )
* Alexa, stop *device* ( Apple TV )

## HomeKit TV (iOS 12.2)

* Alexa, turn on *device*
* Alexa, turn off *device*

* Alexa, raise the volume on *device*
* Alexa, lower the volume on *device*
* Alexa, volume up 20 on *device*
* Alexa, set the volume of *device* to 50

Or

* Alexa, raise the volume on *device*
* Alexa, lower the volume on *device*

These are the remote buttons

* Alexa, pause *device* ( pause/play )
* Alexa, resume *device* ( pause/play )
* Alexa, play *device* ( select )
* Alexa, stop *device* ( back )
* Alexa, next on *device* ( right arrow )
* Alexa, rewind on *device* ( left arrow )

### HomeKit TV - Tested plugins

* Panasonic TV: - homebridge-panasonic-viera-tv@4.1.0
  - Alexa can turn on and off and control volume

* Sony Bravia TV (Android TV) - homebridge-bravia@1.1.0
  - Alexa can turn on and off and control volume

* Sky Q decoder - homebridge-sky-q-experimental@1.0.2
  - Alexa can turn on and off

* Samsung Tizen - homebridge-samsung-tizen
  - Alexa can turn on and off and control volume

* Yamaha AVR - homebridge-yamaha-zone-tv
  - Alexa can turn on and off and control volume. Also control Spotify/Airplay playback

## Speakers

* Alexa, lower the volume on *device*
* Alexa, volume up 20 on *device* ( Speakers )
* Alexa, set the volume of *device* to 50 ( Speakers )

### Bose SoundLink - Change preset

* Alexa, change channel to 1-6 on *device*

## Yamaha Receiver/Spotify control

* Alexa, pause Stereo
* Alexa, resume Stereo
* Alexa, stop Stereo
* Alexa, next song on Stereo
* Alexa, rewind on Stereo

## Contact and Motion Sensors

* These are only visible to routines, no voice commands are available

# Installation of homebridge-alexa

* If you are looking for a basic setup to get this plugin up and running check out this guide (https://sambrooks.net/controlling-homebridge-using-alexa/).

## Prepare Homebridge for plugin installation

The setup of the plugin is very straight forward, and requires enabling insecure mode of each homebridge instance you want to control from Alexa.

1. All homebridge instances that you want to control from Alexa need to run in insecure mode with -I included on the command line.  How you make this change will depend on your installation of homebridge, and how you start homebridge.  If you start from the command line, it would look like this:

```
homebridge -I
```

* If your using systemd to manage homebridge, the -I is added to the file /etc/default/homebridge in the line, HOMEBRIDGE_OPTS ie.

```
# Defaults / Configuration options for homebridge
# The following settings tells homebridge where to find the config.json file and where to persist the data (i.e. pairing and others)
HOMEBRIDGE_OPTS=-I

# If you uncomment the following line, homebridge will log more
# You can display this via systemd's journalctl: journalctl -f -u homebridge
#DEBUG=
```

* If your using pm2 to manage the startup of homebridge, you can add the -I option with these steps

```
pm2 delete homebridge
pm2 cleardump
pm2 start homebridge -- -I
pm2 save
```
To review your settings, use command below to check if homebridge was sucessfully registered to pm2. After that, you can try to reboot your system and check whether you can control homebridge devices with Alexa app.


```
pm2 show homebridge
```


* If you have multiple homebridge options, the -I should be listed first. ie

```
HOMEBRIDGE_OPTS=-I -U /var/homebridge
```

* If you are running with a docker container ( Oznu's), you can add the -I flag following these instructions:

https://github.com/oznu/docker-homebridge/issues/79

```
Variable=HOMEBRIDGE_INSECURE
Value=1
```

```
Go to the Docker app
Stop the Homebridge container
Edit the container and go to the Environment tab
Add environment variable
Save and start container
```

## Install Plugin

2. The setup of homebridge-alexa is similar to other plugins, except it doesn't have any devices in the Home app;-)  I'm just reusing the runtime and configuration file management. And it only needs to installed once if you have multiple homeridge's installed.  It will auto-discover and connect to the other instances.

```
sudo npm install -g homebridge-alexa
```

## Create homebridge-alexa account

3. An account to link your Amazon Alexa to HomeBridge needs to created on this website https://www.homebridge.ca/.  This account will be used when you enable the home skill in the Alexa App on your mobile, and in the configuration of the plugin in homebridge.


## HomeBridge-alexa plugin configuration

4. Add the plugin to your config.json.  The login and password in the config.json, are the credentials you created earlier for the https://www.homebridge.ca/ website.  This only needs to be completed for one instance of homebridge in your environment, it will discover the accessories connected to your other homebridges automatically.

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

* username - Login created for the skill linking website https://www.homebridge.ca/
* password - Login created for the skill linking website https://www.homebridge.ca/

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

* routines - Enables passing to Alexa of real time events from Motion and Contact sensors. For use in the Alexa app to create Routines triggered by these sensors.  Not required unless you are using Alexa Routines.

**For users who enrolled prior to March 22, 2019, you MUST Disable the skill and Enable the skill in the Alexa app as part of setup. If you miss this step, you will see this error `Event Gateway Response Code: 400` in the logs.**

```
"platforms": [
  {
    "platform": "Alexa",
    "name": "Alexa",
    "username": "....",
    "password": "....",
    "routines": true
  }
],
```

* debug - This enables debug logging mode, can be used instead of the command line option ( DEBUG=* homebridge )

```
"platforms": [
  {
    "platform": "Alexa",
    "name": "Alexa",
    "username": "....",
    "password": "....",
    "debug": true
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

* combine - Combine disparate accessories into one common device.  My example here is combining my TV Remote (KODI), which only has ON/OFF and Volume controls into the Apple TV (TV) playback controls. And combining the spotify controls from my Yamaha receiver into the Zone.

```
"platforms": [
  {
    "platform": "Alexa",
    "name": "Alexa",
    "username": "....",
    "password": "....",
    "combine": [{
          "into": "TV",
          "from": ["KODI"]
        }, {
          "into": "Front",
          "from": ["Yamaha"]
        }, {
          "into": "Rear",
          "from": ["Yamaha"]
        }],
  }
],
```

* speakers - Devices to configure as speakers as HomeKit currently does not have a Speaker service

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

* New Parser

As of April 14, 2019 I changed the Homebridge device parser massively, to add support for Locks and Heater/Cooler devices.  To go back to the old device parser, you can set an option oldParser to true.  Default is to the new parser.

```
"oldParser": true
```

## Initial Testing and confirming configuration

5. Start homebridge in DEBUG mode, to ensure configuration of homebridge-alexa is correct.  This will need to be executed with your implementations configuration options and as the same user as you are running homebridge. If you are homebridge with an autostart script ie systemd, you will need to stop the autostart temporarily.

ie
```
DEBUG=alexa* homebridge -I
```

6. Please ensure that homebridge starts without errors, and output should be similar to this.  This is from my setup, and I have several instances of homebridge so you may have a different number of alexaHAP lines.

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

## Enable Homebridge smarthome skill and link accounts

7. In your Amazon Alexa app on your phone, please search for the "Homebridge" skill, and enable the skill.  You will need to Enable and link the skill to the account you created earlier on https://www.homebridge.ca/

## Discover Devices

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

# Service Availability and Issues

## Homebridge cloud service monitoring ( homebridge.ca )

* Real time monitoring of the homebridge.ca cloud service is provided by [Uptime Robot](https://stats.uptimerobot.com/2WmEDHyV6).

* Operational event reporting and alerting is sent to the [#hap-alexa](https://homebridgeteam.slack.com/messages/hap-alexa/) channel in the Homebridge slack instance, and the uptime robot reports events there in real time.

## Raising Issues and Troubleshooting

### Troubleshooting ###

<img align="right" src="docs/AccountStatus.png" height="200">

To assist in troubleshooting setup issues with your account, the hombridge.ca website displays the status of your account.

From here you should be able to determine if your plugin is communicating with the service and if your Amazon Alexa account has enabled the Homebridge-Alexa skill.

### Known Issues

* I have started recording troubleshooting tips here based on issues seen by the community [Troubleshooting](Troubleshooting.MD).
* All homebridge PIN's in your setup need to be set to the same value.
* Whitelisting/blacklisting of accessories is not supported, but this can be achieved at the plugin level by putting the plugins you don't want exposed to Alexa in their own instance of HomeBridge, and for that instance of Alexa, don't include -I command line option.  Discovery will fail for that instance, and the accessories will not be exposed.
* An Alexa device or a software based Alexa is required. Using just the App or Website does not work, and device discovery will fail to find devices. The Reverb app is a software based Alexa that is known to work.
* The maximum number of supported devices is 300.  This is a limitation from the from the Amazon side, and not the plugin.
* If your Amazon account is not domiciled in the country where your Alexa is located the skill will not work.  This is a limitation on the Amazon side and not with the plugin.  ie if you are in the UK and use an Amazon.com account, the skill will not work.  You need to use an Amazon account domiciled in the UK

### Slack Channel

I have created a slack channel at (https://homebridgeteam.slack.com/messages/hap-alexa/) to troubleshoot issues not on the troubleshooting page.  If you reach out there, I'm usually available.  If you don't have a slack account and need an invite, one is available via the Homebridge README / Community (https://github.com/nfarina/homebridge#community)

### Debug logs

To collect a debug log, please start homebridge with this command line

```
DEBUG=* homebridge -I
```

### Homebridge Accessory Dump

Sometimes during troubleshooting I need a dump of your homebridge accessories. Please use this command to collect it.  If needed you can change the ip address, port or pin to match your environment.

```
curl -X PUT http://127.0.0.1:51826/accessories --header "Content-Type:Application/json" --header "authorization: 031-45-154"
```

# Previous version of homebridge-alexa ( Version 1 )

## Upgrading from the previous, non skill based version of homebridge-alexa

If you had installed the previous version of homebridge-alexa with the special version of homebridge and HAP-NodeJS, it can disabled without reinstalling homebridge.  You can disable it by removing the configuration parameter ssdp from your config.json.  This will disable the previous version.

```
"ssdp": 1900
```

Also please have Alexa forget all your old devices.

* The old version is still available and the instructions for installation can be found [here.](V1_README.md).

# Roadmap

See [Roadmap](Roadmap.md)

# Credits

* Ben Hardill - For the inspiration behind the design.
* Chrisx9 - German translation
* Tait Brown - HomeSkill Icon
* ozno - Recommendation for the bonjour MDNS implementation, and testing on RPI 0 W
* fazerize - Initial support for Thermostats
* francescob - Validate TV Integration for homebridge-panasonic-viera-tv@4.1.0, homebridge-bravia@1.1.0 and homebridge-sky-q-experimental@1.0.2
* jelvs - Validate TV Integration for homebridge-samsung-tizen
* krocko - bose soundlink preset / channel change
