**homebridge-alexa** Version 2 - Home Skill Based

[![NPM Downloads](https://img.shields.io/npm/dm/homebridge-alexa.svg?style=flat)](https://npmjs.org/package/homebridge-alexa)

<p align="center">
    <img src="https://cl.ly/99e68ac49cef/Logo2x.png" height="200">
</p>

Enable Amazon Alexa access and control your homebridge controlled devices and accessories.  Full support for all Amazon Alexa devices, including the echo 2nd Generation and software based solutions.  Uses an Amazon smart home skill based approach for integration between HomeBridge and Amazon Alexa.

Country availability - The plugin is available in these countries, English (AU), German (DE), English (CA), English (US), French (FR), English (UK).  

Currently in beta/certification - Italian (IT), English (IN), Spanish (ES), Japanese (JP), and Spanish (MX).

# Jan 31 - Submitted skill for certification, the beta is closed for new participants at this time.  Amazon has given a target of Feb 18th to supply results of the certification.

# IMPORTANT - For existing users, installing an updated version of the plugin after XXXX XX, 2019 will cause Alexa to mark all your existing devices as Offline and create new ones.  
You will need to manually remove all existing devices after upgrading and setup and groups or routines again.  This would only occur with the first update after this date.  I would strongly recommend making note and recording the devices that are in each of your groups and routines prior to updating so you can recreate them again afterwards.  I made a large change around the device identifiers between homebridge and Alexa, and this should avoid any further duplicate devices.  For reference, I'm using these values to create a unique key for Alexa homebridge name, homebridge username, plugin manufacturer and accessory name.  ( homebridge name and username are from the config.json bridge settings.)  If you never change these values, Alexa should never discover duplicate devices.

# Homebridge-Alexa

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
   * [Table of Contents](#table-of-contents)
   * [BETA Test for Sending Events to Alexa and using in routines](#BETA-Test-for-Sending-Events-to-Alexa-and-using-in-routines)
   * [New features with Version 2](#new-features-with-version-2)
      * [HomeKit/Homebridge Devices supported](#homekithomebridge-devices-supported)
         * [Native Support](#native-support)
         * [Supported as Other](#supported-as-other)
      * [Voice commands supported](#voice-commands-supported)
      * [Color temperature](#color-temperature)
         * [Color Temperatures](#color-temperatures)
      * [AppleTV](#appletv)
      * [Speakers](#speakers)
      * [Yamaha Receiver/Spotify control](#yamaha-receiverspotify-control)
      * [Unsupported device types](#unsupported-device-types)
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
   * [Issues, Questions or Problems](#issues-questions-or-problems)
      * [Known Issues](#known-issues)
   * [Previous version of homebridge-alexa ( Version 1 )](#previous-version-of-homebridge-alexa--version-1-)
      * [Upgrading from the previous, non skill based version of homebridge-alexa](#upgrading-from-the-previous-non-skill-based-version-of-homebridge-alexa)
   * [Roadmap](#roadmap)
   * [Credits](#credits)

<!-- Added by: sgracey, at:  -->

<!--te-->

# Features

* Support for Light Bulbs, Switches and outlets
* Support for Color Light Bulbs and Colour Temperature of white Light bulbs
* Support for Fans (As Alexa doesn't support Fans coverings I'm using Other)
* Support for Window coverings/blinds (As Alexa doesn't support window coverings I'm using Other)
* Support for Garage Doors
* Support for Temperature, Contact and Motion Sensors.  Also supports sending real time updates from Contact and Motion sensors to Alexa, for use in routines.
* Support for Fan2 aka Dyson fans
* Support for Valves, Sprinklers and Shower Heads (As Alexa doesn't support these, they are Other)
* Support for more than 100 accessories
* Support for generation 2 Echo's and other Alexa devices not supported with the original version
* Support for Speakers ( Tested with homebridge-yamaha-home and homebridge-http-irblaster )
* Support for Apple TV ( Supports homebridge-apple-tv )
* Support Spotify playback controls via homebridge-yamaha-home

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
* Door/Garage Door - Supported as a on/off device
* Thermostat - Partial support only ( Set target Temperature in celsius )

### Supported as Other

* Fans - Supported as Other
* Window Coverings / Blinds - Supported as Other
* Valves, Sprinklers and Shower Heads - Supported as a light bulb

## Voice commands supported

* Alexa, discover devices
* Alexa, turn on  *device*
* Alexa, turn off  *device*
* Alexa, set *device* to 50
* Alexa, what is the temperature in the *device* ( Not supported in Japan )
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

* Camera's ( for use with an Alexa show etc )
* Eve devices
* Locks
* Security Systems

# BETA Test for Sending Events to Alexa and using in routines

One of my next hopefully high scoring WAF features, will be to enable Alexa Routines to act on events from Contact and Motion sensors.  And prior to making this feature widely available was looking for participants in a BETA of the new feature.  To participate in this, you need to be part of the current BETA for Spanish, Italian, English India and Japanese.  ( Unfortunately adding new participants to the additional language beta is not possible, as the skill is currently in for certification with Amazon).   You would also need to have Motion Sensors, Contact Sensors, Garage Door or Blind accessories.  Events are not support for other device types.

For Garage Door and Blind accessories, the plugin / device would need to be event enabled ie if you open your garage door via the button in the garage the Home app updates in real time with the status change.  Similar for blinds as well.

As testing this Beta may cause your configuration to go unstable, please be ready for a low WAF score incase it goes sideways.

Also this will require editing of the config.json and possibly sending log files over with issues.  So please be prepared.

## Steps to enable

1 - Installing the events beta will cause Alexa to mark all your existing devices offline.  And you will need to manually remove all existing devices after upgrading and setup and groups or routines again.  This should only occur once with the beta.  I would strongly recommend making note and recording the devices that are in each of your groups and routines prior to updating so you can recreate them again afterwards.  

2 - In the Alexa app unlink and relink the Homebridge skill.  This will enable your account to send events to alexaActions

3 - Install the event beta test version of the plugin

```
sudo npm install -g https://github.com/NorthernMan54/homebridge-alexa#event
```

4 - In your config.json file, please add a new option called events.

```
"platforms": [
  {
    "platform": "Alexa",
    "name": "Alexa",
    "username": "....",
    "password": "....",
    "debug": true,
    "events": true
  }
],
```

5 - Restart homebridge

6 - Remove your existing homebridge devices in Alexa and discover again. For myself I used the Alexa website and just 'Forget All', then 'Discover' again.  Then I used the Alexa app to recreate all my groups and existing routines.

7 - Go to Routines in the Alexa app, and select 'When this happens' -> 'Device' and your supported devices should appear.

# Installation of homebridge-alexa

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

* events - Enables passing to Alexa of support device events for use in routines.  **For users who enrolled prior to XXXXX XX, 2019, you will need to unlink the skill and relink the skill in the Alexa app in order to enable events.**

```
"platforms": [
  {
    "platform": "Alexa",
    "name": "Alexa",
    "username": "....",
    "password": "....",
    "events": true
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
* An Alexa device or a software based Alexa is required. Using just the App or Website does not work, and device discovery will fail to find devices. The Reverb app is a software based Alexa that is known to work.
* Thermostats - Partial support only ( Set target Temperature in celsius )

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
