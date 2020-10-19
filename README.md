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
* Supports the following HomeKit accessory types Lightbulb, Outlet, Fan, Fan2, Temperature Sensor, Window Coverings, Garage Doors and Switches.
* Supports passing of sensor updates in real time to Alexa for use in routines.
* Includes support for brightness and colour.
* Creates a Contact Sensor that monitors the status of the connect to the Homebridge Alexa Cloud Servers.
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
      * [Garage door, Blinds and Window Coverings](#garage-door-blinds-and-window-coverings)
         * [Garage Door With door = false](#garage-door-with-door--false)
         * [Window coverings / blinds With blind = false](#window-coverings--blinds-with-blind--false)
         * [Garage Door With blind = true ( Not supported in all countries )](#garage-door-with-blind--true--not-supported-in-all-countries-)
         * [Window coverings / blinds With blind = true ( Not supported in all countries )](#window-coverings--blinds-with-blind--true--not-supported-in-all-countries-)
      * [Thermostat's and Heater / Cooler's](#thermostats-and-heater--coolers)
      * [Lock / Unlock Doors](#lock--unlock-doors)
      * [Temperature sensors](#temperature-sensors)
      * [AppleTV ( homebridge-apple-tv or homebridge-apple-tv-remote )](#appletv--homebridge-apple-tv-or-homebridge-apple-tv-remote-)
      * [HomeKit Television](#homekit-television)
         * [HomeKit Television - Tested plugins](#homekit-television---tested-plugins)
         * [Television Inputs and Channels](#television-inputs-and-channels)
      * [Speakers](#speakers)
         * [Bose SoundLink - Change preset](#bose-soundlink---change-preset)
      * [Yamaha Receiver/Spotify control](#yamaha-receiverspotify-control)
      * [Contact and Motion Sensors](#contact-and-motion-sensors)
      * [Door bell devices](#door-bell-devices)
   * [Installation of homebridge-alexa](#installation-of-homebridge-alexa)
      * [Prepare Homebridge for plugin installation](#prepare-homebridge-for-plugin-installation)
      * [Install Plugin](#install-plugin)
      * [Create homebridge-alexa account](#create-homebridge-alexa-account)
      * [HomeBridge-alexa plugin configuration](#homebridge-alexa-plugin-configuration)
         * [Required parameters](#required-parameters)
         * [Optional parameters](#optional-parameters)
            * [pin](#pin)
            * [routines](#routines)
            * [blind](#blind)
            * [door](#door)
            * [debug](#debug)
            * [refresh](#refresh)
            * [filter](#filter)
            * [deviceList &amp; deviceListHandling](#devicelist--devicelisthandling)
            * [combine](#combine)
            * [speakers](#speakers-1)
            * [Inputs](#inputs)
            * [Apple TV](#apple-tv)
            * [Yamaha Spotify Controls](#yamaha-spotify-controls)
            * [New Parser](#new-parser)
      * [Initial Testing and confirming configuration](#initial-testing-and-confirming-configuration)
      * [Enable Homebridge smarthome skill and link accounts](#enable-homebridge-smarthome-skill-and-link-accounts)
      * [Discover Devices](#discover-devices)
   * [Service Availability and Issues](#service-availability-and-issues)
      * [Homebridge cloud service monitoring ( homebridge.ca )](#homebridge-cloud-service-monitoring--homebridgeca-)
      * [Raising Issues and Troubleshooting](#raising-issues-and-troubleshooting)
         * [Troubleshooting](#troubleshooting)
         * [Known Issues](#known-issues)
         * [Discord Channel](#discord-channel)
         * [Debug logs](#debug-logs)
         * [Homebridge Accessory Dump](#homebridge-accessory-dump)
   * [Roadmap](#roadmap)
   * [Credits](#credits)

<!-- Added by: sgracey, at:  -->

<!--te-->

# Supported devices

* Support for Light Bulbs, Switches and outlets
* Support for Color Light Bulbs and Colour Temperature of white Light bulbs
* Support for Fans (As Alexa doesn't support Fans coverings I'm using Other)
* Support for Window coverings/blinds
* Support for Garage Doors
* Support for Temperature, Contact and Motion Sensors.  
* Support for Occupancy Sensors as a Contact sensor.  
* Also supports sending real time updates from Contact, Occupancy and Motion sensors to Alexa, for use in routines.
* Support for Fan2 aka Dyson fans
* Support for Valves, Sprinklers and Shower Heads (As Alexa doesn't support these, they are Other)
* Support for more than 100 accessories
* Support for generation 2 Echo's and other Alexa devices not supported with the original version
* Support for Speakers ( Tested with homebridge-yamaha-home, homebridge-soundtouch and homebridge-http-irblaster )
* Support for Apple TV ( Supports homebridge-apple-tv, and homebridge-apple-tv-remote )
* Support Spotify playback controls on Yamaha Receivers via homebridge-yamaha-home
* Support for door locks
* Support for door bells ( Tested with homebridge-camera-ffmpeg )

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
* HomeKit Television ( Initial support only On/Off, Inputs and Volume Control )
* Garage Doors and Window Coverings/Blinds
* Door bells

### Supported as Other Types

* Fans, Humidifier Dehumidifier and Air Purifiers - Supported as a Switch
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

## Garage door, Blinds and Window Coverings

### Garage Door With door = false

* Alexa, turn on *device* ( Open's a garage door )
* Alexa, turn off *device* ( Close's a garage door )

See [example](https://github.com/NorthernMan54/homebridge-alexa/wiki/Garage-Door) for using a routine to fix the wording

### Window coverings / blinds With blind = false

* Alexa, turn on *device* ( Open's blinds )
* Alexa, turn off *device* ( Close's blinds )
* Alexa, set *device* to 50 ( Moves blinds to 50% )

### Garage Door With blind = true ( Not supported in all countries )

* Alexa, raise *device* ( Open's a garage door )
* Alexa, open *device* ( Open's a garage door )
* Alexa, lower *device* ( Close's a garage door )
* Alexa, close *device* ( Close's a garage door )

* Opening a garage door requires configuring a voice pin in the Alexa App.

### Window coverings / blinds With blind = true ( Not supported in all countries )

* Alexa, raise *device* ( Open's blinds )
* Alexa, lower *device* ( Close's blinds )
* Alexa, set *device* to 50 ( Moves blinds to 50% )

## Thermostat's and Heater / Cooler's

* Alexa, set thermostat to 20
* Alexa, set thermostat to heat/cool/automatic/off

Adamo Maisano provided a deeper [comparison](https://github.com/NorthernMan54/homebridge-alexa/wiki/Thermostat-Voice-Control-Comparison) of Thermostat Voice Control [here](https://github.com/NorthernMan54/homebridge-alexa/wiki/Thermostat-Voice-Control-Comparison).

## Lock / Unlock Doors

* Alexa, unlock my *device* ( Amazon is blocking this function )
* Alexa, lock my *device*

## Temperature sensors

* Alexa, what is the temperature in the *device* ( Not supported in Japan )

## AppleTV ( homebridge-apple-tv or homebridge-apple-tv-remote )

* Alexa, pause *device* ( Apple TV )
* Alexa, resume *device* ( Apple TV )
* Alexa, play *device* ( Apple TV )
* Alexa, stop *device* ( Apple TV )

## HomeKit Television

* Alexa, turn on *device*
* Alexa, turn off *device*

* Alexa, raise the volume on *device*
* Alexa, lower the volume on *device*
* Alexa, volume up 20 on *device*
* Alexa, set the volume of *device* to 50

These are the remote buttons

* Alexa, pause *device* ( pause/play )
* Alexa, resume *device* ( pause/play )
* Alexa, play *device* ( select )
* Alexa, stop *device* ( back )
* Alexa, next on *device* ( right arrow )
* Alexa, rewind on *device* ( left arrow )

* Alexa, change input to *input* on the *device*

### HomeKit Television - Tested plugins

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

* LG WebOS TV - homebridge-lgwebos-tv
  - Alexa can turn on and off.  Volume control has not validated

### Television Inputs and Channels

* Alexa, change channel to cbc on *device* ( Station name )
* Alexa, change input to *input* on the *device*

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

## Door bell devices

* Their is no voice control of door bells, only the ability to have Alexa announce when the door bell is triggered.  For a sample here is my [Door Bell](https://youtu.be/PhGbc_TO8pk) being rang.

# Installation of homebridge-alexa

* If you are looking for a basic setup to get this plugin up and running check out this guide (https://sambrooks.net/controlling-homebridge-using-alexa/).  And here is another setup guide (https://www.youtube.com/watch?v=Ylg4yiw8ofM).

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

#### pin
  - If you had changed your homebridge pin from the default of "pin": "031-45-154" ie

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

#### routines
  - Enables passing to Alexa of real time events from Motion and Contact sensors. For use in the Alexa app to create Routines triggered by these sensors.  Not required unless you are using Alexa Routines.

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

#### blind
  - Enables natural wording for opening and closing blinds, and window coverings.  Not supported in all countries.  Defaults to false

```
"platforms": [
  {
    "platform": "Alexa",
    "name": "Alexa",
    "username": "....",
    "password": "....",
    "blind": true
  }
],
```

#### door
  - Enables natural wording for opening and closing garage doors.  Not supported in all countries.  Please note that opening a garage door requires setting a voice pin within the Alexa app.  Defaults to false

```
"platforms": [
  {
    "platform": "Alexa",
    "name": "Alexa",
    "username": "....",
    "password": "....",
    "door": true
  }
],
```

#### debug
  - This enables debug logging mode, can be used instead of the command line option ( DEBUG=* homebridge )

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

#### refresh
  - Frequency of refreshes of the homebridge accessory cache, in seconds.  Defaults to 15 minutes.

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

#### filter
  - Limits accessories shared with Alexa to a single homebridge instance.  ( I'm using this setting with Amazon for skill testing. ).  The setting is ip:port of homebridge instance.

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

#### deviceList & deviceListHandling
  - allow or deny devices by name to be exposed to alexa

```
"platforms": [
  {
  "platform": "Alexa",
  "name": "Alexa",
  "username": "....",
  "password": "....",
  "deviceListHandling": "deny",   // or allow
  "deviceList":
    [
      "LightBlub",
      "GarageDoor",
      "SecureDevice"
    ]
  }
],
```

#### combine
  - Combine disparate accessories into one common device.  My example here is combining my TV Remote (KODI), which only has ON/OFF and Volume controls into the Apple TV (TV) playback controls. And combining the spotify controls from my Yamaha receiver into the Zone.

```
"platforms": [
  {
    "platform": "Alexa",
    "name": "Alexa",
    "username": "....",
    "password": "....",
    "combine": [{
          "into": "TV",
          "from": ["KODI", "Power (TV)"]
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

* into - Device name to combine into
* from - Device name to combine from, can be a list of multiple devices.


#### speakers
  - Devices to configure as speakers as HomeKit currently does not have a Speaker service, and enable the alexa phase `Alexa, raise the volume on`.

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

* manufacturer - Is the manufacturer of the accessory as shown in the Home App
* name - Is the name of the accessory as shown in the Home App

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

#### Inputs

  - This combines several buttons that control inputs on a TV or Stereo into an Alexa input control and enables the phrase `Alexa, change to input to`. For the names of the inputs, Amazon provided a list ( see alexa name below ) that you can choose from.  You can map multiple alexa names to the same button as well.

`Alexa, change input to Tuner on the TV`

`Alexa, change input to HDMI 1 on the TV`

```
{
    "platform": "Alexa",
    "username": "...",
    "password": "...",
    "name": "Alexa",
    "inputs": [{
      "into": "TV",
      "devices": [{
        "manufacturer": "HTTP-IRBlaster",
        "name": "Tuner",
        "alexaName": "TUNER"
      }, {
        "manufacturer": "HTTP-IRBlaster",
        "name": "Tuner",
        "alexaName": "TV TUNER"
      }, {
        "manufacturer": "HTTP-IRBlaster",
        "name": "Tuner",
        "alexaName": "TV"
      }, {
        "manufacturer": "HTTP-IRBlaster",
        "name": "HDMI1",
        "alexaName": "HDMI 1"
      }, {
        "manufacturer": "HTTP-IRBlaster",
        "name": "HDMI1",
        "alexaName": "TV KODI"
      }, {
        "manufacturer": "HTTP-IRBlaster",
        "name": "HDMI1",
        "alexaName": "MEDIA PLAYER"
      }, {
        "manufacturer": "HTTP-IRBlaster",
        "name": "HDMI2",
        "alexaName": "HDMI 2"
      }, {
        "manufacturer": "HTTP-IRBlaster",
        "name": "HDMI2",
        "alexaName": "TV NETFLIX"
      }]
    }],
```

In my setup I use an OTA Antenna, hence the Tuner option and have a KODI box on HDMI 1, and a Apple TV we use for Netflix on HDMI 2.  For the alexaName's "TV KODI", "TV TUNER", and "TV NETFLIX" these were not part of the Amazon documentation and may stop working at any time or may not work in your region.

* into - Name of the existing accessory to add the input function to.  In my setup this is my Apple TV accessory.

* manufacturer - Is the manufacturer of the accessory as shown in the Home App

* name - Is the name of the accessory as shown in the Home App

* alexaName - This the input your are asking Alexa to change to.

```
AUX 1, AUX 2, AUX 3, AUX 4, AUX 5, AUX 6, AUX 7, BLURAY, CABLE, CD, COAX 1, COAX 2, COMPOSITE 1, DVD, GAME,
HD RADIO, HDMI 1, HDMI 2, HDMI 3, HDMI 4, HDMI 5, HDMI 6, HDMI 7, HDMI 8, HDMI 9, HDMI 10, HDMI ARC, INPUT 1,
INPUT 2, INPUT 3, INPUT 4, INPUT 5, INPUT 6, INPUT 7, INPUT 8, INPUT 9, INPUT 10, IPOD, LINE 1, LINE 2, LINE 3,
LINE 4, LINE 5, LINE 6, LINE 7, MEDIA PLAYER, OPTICAL 1, OPTICAL 2, PHONO, PLAYSTATION, PLAYSTATION 3,
PLAYSTATION 4, SATELLITE, SMARTCAST, TUNER, TV, USB DAC, VIDEO 1, VIDEO 2, VIDEO 3, XBOX
```

#### Apple TV

  - This is the config from my Apple TV using the homebridge-apple-tv plugin after completing the pairing.  Please note, *"showDefaultSwitches": true* and   *"defaultSwitchesIncludeATVName": true*, are required parameters.  Please note I blanked out the devices/credentials section with my ATV credentials.

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

- This is the config for the homebridge-apple-tv-remote plugin.  This allows you to pause/play forward/rewind on device.

Please note that the name in brackets ie (TV) will be the Name alexa uses to control your AppleTV

```
{
  "platform": "AppleTvPlatform",
  "devices": [{
    "name": "Family Room (TV)",
    "credentials": "XXXXXXXXXXXX",
    "isOnOffSwitchEnabled": true,
    "onOffSwitchName": "Power (TV)",
    "isPlayPauseSwitchEnabled": true,
    "playPauseSwitchName": "Play (TV)",
    "commandSwitches": [{
      "name": "Pause (TV)",
      "commands": [{
        "key": "pause",
        "longPress": false
      }]
    }, {
      "name": "Right (TV)",
      "commands": [{
        "key": "right",
        "longPress": false
      }]
    }, {
      "name": "Left (TV)",
      "commands": [{
        "key": "left",
        "longPress": false
      }]
    }]
  }],
  "isApiEnabled": false
}
```

Also to enable turning on and off your Apple TV, add this to your homebridge-alexa configuration.

```
"combine": [{
      "into": "TV",
      "from": ["Power (TV)"]
    }]
```

#### Yamaha Spotify Controls

This uses the plugin homebridge-yamaha-home and a Yamaha Receiver which includes Spotify and Spotify Playback Controls.

#### New Parser

~~As of April 14, 2019 I changed the Homebridge device parser massively, to add support for Locks and Heater/Cooler devices.  To go back to the old device parser, you can set an option oldParser to true.  Default is to the new parser.~~

```
"oldParser": true
```

Support for the oldParser option was **deprecated** with version 0.5.0

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

* Contact Sensor **Alexa** monitors the connection to the cloud service.  When the contact sensor is **Closed**, the connection has been **successfully** made to the cloud service, and when the contact sensor is **Open** the connection to the cloud service has **not** been made. To determine why the connection to the cloud service is not working, please check your homebridge log files. During **normal** operation the Contact Sensor should be **Closed**.

* Real time monitoring of the homebridge.ca cloud service is provided by [Uptime Robot](https://stats.uptimerobot.com/2WmEDHyV6).

* Cloud service operational event reporting and alerting is sent to the #homebridge-alexa channel in the Homebridge Discord instance, and the uptime robot reports events there in real time.

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

### Discord Channel

I have created a Discord channel on the homebridge discord server to troubleshoot issues not on the troubleshooting page.  If you reach out there, I'm usually available.  The channel is called #homebridge-alexa

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
* pwilms - deviceList feature
