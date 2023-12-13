Installation and Configuration of Homebridge Alexa
==================================================

<!--ts-->
* [Installation and Configuration of Homebridge Alexa](#installation-and-configuration-of-homebridge-alexa)
* [Setup Instructions](#setup-instructions)
   * [Create Homebridge-Alexa Cloud Services Account](#create-homebridge-alexa-cloud-services-account)
   * [Install and Configure the Plugin](#install-and-configure-the-plugin)
      * [Installation in Homebridge UI](#installation-in-homebridge-ui)
      * [Configuration in Homebridge UI](#configuration-in-homebridge-ui)
   * [Enabling and linking the Homebridge Smart Home Skill](#enabling-and-linking-the-homebridge-smart-home-skill)
      * [Viewing Account Status](#viewing-account-status)
* [Advanced Setup Instructions, including advanced configuration options](#advanced-setup-instructions-including-advanced-configuration-options)
   * [Prepare Homebridge for plugin installation](#prepare-homebridge-for-plugin-installation)
   * [Install Plugin](#install-plugin)
   * [Create homebridge-alexa account](#create-homebridge-alexa-account)
   * [HomeBridge-alexa plugin configuration](#homebridge-alexa-plugin-configuration)
      * [Required Settings](#required-settings)
      * [Optional Settings](#optional-settings)
         * [debug](#debug)
         * [pin](#pin)
         * [routines](#routines)
         * [deviceList &amp; deviceListHandling - Filtering of devices by name, either allow or allow](#devicelist--devicelisthandling---filtering-of-devices-by-name-either-allow-or-allow)
      * [Advanced Settings](#advanced-settings)
         * [CloudTransport - Cloud Server Connection Transport](#cloudtransport---cloud-server-connection-transport)
         * [keepalive - Cloud Server Connection Keepalive](#keepalive---cloud-server-connection-keepalive)
         * [refresh - Accessory Cache Refresh Interval](#refresh---accessory-cache-refresh-interval)
         * [filter - Homebridge Instance Filter](#filter---homebridge-instance-filter)
         * [mergeServiceName - Alternate device naming](#mergeservicename---alternate-device-naming)
         * [blind](#blind)
         * [door](#door)
      * [Speaker Settings](#speaker-settings)
         * [speakers](#speakers)
      * [Combine Accessories](#combine-accessories)
         * [combine](#combine)
         * [Inputs](#inputs)
         * [Apple TV](#apple-tv)
         * [Yamaha Spotify Controls](#yamaha-spotify-controls)
   * [Initial Testing and confirming configuration](#initial-testing-and-confirming-configuration)
   * [Enable Homebridge smarthome skill and link accounts](#enable-homebridge-smarthome-skill-and-link-accounts)
   * [Discover Devices](#discover-devices)

<!-- Created by https://github.com/ekalinin/github-markdown-toc -->
<!-- Added by: runner, at: Wed Dec 13 14:15:55 UTC 2023 -->

<!--te-->

# Setup Instructions

## Create Homebridge-Alexa Cloud Services Account

This plugin requires the usage of cloud services to link your Amazon Alexa Account to the plugin.  Please create an account at https://www.homebridge.ca/.  The account details will be needed as part of plugin configuration and for linking the Homebridge smart home skill.

Please ensure that you validate the email address you entered.  And the username and passwords are case sensitive.

## Install and Configure the Plugin

### Installation in Homebridge UI

From the Plugins tab, search for and install the "Homebridge Alexa" plugin

### Configuration in Homebridge UI

Please enter the username and password you created earlier at https://www.homebridge.ca/.

If you have changed your homebridge PIN from the default `031-45-154`, please enter it under the optional settings.

Restart homebridge

## Enabling and linking the Homebridge Smart Home Skill

In the Amazon Alexa Application on your smart phone, search for the Homebridge Skill and enable it.  When you enable the skill, it will take you to the https://www.homebridge.ca/ website to enable and link the skill to the plugin.  You can now ask Alexa to `discover devices` and it should discover your homebridge devices.

### Viewing Account Status

On the homebridge.ca website you can view your account status, and identify any setup issues.

# Advanced Setup Instructions, including advanced configuration options

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

### Required Settings

* name - Plugin name as displayed in the Homebridge log
* username - Login created for the skill linking website https://www.homebridge.ca/
* password - Login created for the skill linking website https://www.homebridge.ca/

### Optional Settings

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
  - Enables passing to Alexa of real time events from Motion and Contact sensors. For use in the Alexa app to create Routines triggered by these sensors.  Not required unless you are using Alexa Routines triggered by Homebridge devices.

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

#### deviceList & deviceListHandling - Filtering of devices by name, either allow or allow
  - allow or deny devices by name to be exposed to alexa.  Values are checked to see if they are contained within the name.  ( Under the covers it is using regex, so more complex options are available )

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
      "LightBulb",
      "GarageDoor",
      "SecureDevice"
    ]
  }
],
```

### Advanced Settings

#### CloudTransport - Cloud Server Connection Transport

- Transport options for cloud server connection. MQTTS - this is the recommended setting. MQTT - this is the original/legacy option. WSS - this is the an alternative transport option.

```
"platforms": [
  {
    "platform": "Alexa",
    "name": "Alexa",
    "username": "....",
    "password": "....",
    "CloudTransport": "mqtts"
  }
],
```

#### keepalive - Cloud Server Connection Keepalive

- Frequency of keepalive messages to cloud server, in minutes. Defaults to 5 minutes.  Do not change from default unless requested as part of problem investigation.

```
"platforms": [
  {
    "platform": "Alexa",
    "name": "Alexa",
    "username": "....",
    "password": "....",
    "keepalive": 5
  }
],
```

#### refresh - Accessory Cache Refresh Interval

- Frequency of refreshes of the homebridge accessory cache, in seconds. Defaults to 900 Seconds ( 15 minutes ). This is the interval before new devices/homebridge instances are discovered.  This should never require changing, unless you are frequently changing your homebridge configuration without restarting the plugin.

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

#### filter - Homebridge Instance Filter
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

#### mergeServiceName - Alternate device naming
  - An alternate device naming approach that combines the HomeKit internal services names for an accessory to resolve some issues with duplicate device names.  This option if enabled is a break changing for existing implementations, and will cause existing devices to no longer be controllable by Alexa.  You will need to remove the non-functioning devices from the Alexa App and ask Alexa to discover devices again to resolve.

```
"platforms": [
  {
    "platform": "Alexa",
    "name": "Alexa",
    "username": "....",
    "password": "....",
    "mergeServiceName": true
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

### Speaker Settings

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

### Combine Accessories


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
