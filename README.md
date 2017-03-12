
# homebridge-alexa

Homebridge-Alexa is not your typical homebridge plugin, but a placeholder for my work to expose
homebridge controlled accessories to Amazon Alexa. This is a version of homebridge and hap-nodejs that enables
Amazon Alexa to discover accessories controlled and managed by homebridge. The discovery of homebridge devices
leverages the native support of Hue devices by Alexa, and does not require a skill to be installed on Alexa.

* Supports devices of homekit type Lightbulb, Outlet, and Switch.  Others are not exposed.
* If device supports the 'Brightness', then the ability to set brightness is included.
* This does not have any devices or accessories that are visible from Homekit,
and does not need to be added on the Home app.
* This only works with real Amazon devices, and does not work with faux Amazon devices like Amazon AVS or AlexaPI

# Installation

* To enable this capability please install this special version of Homebridge and HAP-NodeJS.

```
sudo npm install -g https://github.com/NorthernMan54/homebridge
```

# Configuration

* add a new setting "ssdp" to the bridge section of your homebridge config.json file. Value must be 1900. i.e

```
 "bridge": {
    "name": "Howard",
    "username": "CC:22:3D:E3:CE:31",
    "port": 51826,
    "pin": "031-45-154",
    "ssdp": 1900
},
```
* If the setting is not enabled, then your homebridge instance will not be visible to Alexa,  useful when you have devices / plugins that you don't want Alexa to see.  For example, Philips hue or Belkin wemo devices.

* Ask Alexa to Discover Devices.  She take about 20 seconds to discover your devices.

# Voice commands supported

* Alexa, turn on the _______
* Alexa, turn off the _______
* Alexa, set ______ to number percent

# Known issues

* This only works with Real Amazon Alexa devices, any RaspberryPI based devices like AlexaPI are not supported.
* If you run homebridge on the same machine as Kodi, this feature will not work and you will receive an error during startup. If you start homebridge first, then Kodi it should be okay.
* Only one per machine. If you are running multiple copies of homebridge on a machine, it will not work.
* If you have hue devices and homebridge-hue, your hue devices will appear twice to Alexa.  If you want to avoid this, setup a second instance of homebridge and move the homebridge-hue plugin to it, and don't enable this feature.

# Troubleshooting / Issues

* I have created a slack channel at (https://homebridgeteam.slack.com/messages/hap-alexa/) to troubleshoot issues.
* To enable debug mode, please start homebridge in debug mode. ie
  DEBUG=* homebridge
* For issues, please use the slack channel and post a debug log

# Credits

* dsandor/fauxmojs - For the NodeJS UPNP/SSDP module
* BWS Systems - For the inspiration around the Hue emulation based approach
