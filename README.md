# homebridge-alexa 2nd Gen Beta Test

Enable Amazon Alexa access to you homebridge controlled devices and accessories.  Full support for all Amazon Alexa devices, including the echo 2nd Generation.

* Supports multiple homebridge instances running on your network.
* Autodiscovery of multiple Homebridge's
* Supports devices of homekit Service type Lightbulb, Outlet, Fan, and Switch
* If device supports the 'Brightness Characteristic', then the ability to set a
brightness is included.
* This plugin does not have any devices or accessories that are visible from Homekit,
and does not need to be added on the Home app.
* The plugin does not need to be installed in your 'main' homebridge instance.  It
can be installed in any 'Homebridge' instance in your setup.

Alexa device names are the same as the homebridge device names.

This only supports accessories connected via a homebridge plugin, any 'Homekit'
accessories are not supported, and will never be supported.

# Voice commands supported

* Alexa discover devices
* Alexa, turn on the _______
* Alexa, turn off the _______
* Alexa, set ______ to number percent

# Getting access to the Alexa homebridge-alexa homeskill beta

Send me a direct message via slack / Homebridge at NorthernMan54 with your amazon login.  I will then enroll yourself into the beta.

# Alexa Home Skill configuration

1. To enable Alexa Homeskill account linking you need to create an account for yourself at https://homebridge.cloudwatch.net

2. Search for the homebridge skill on the Alexa App/Web site, and link you Amazon account to the account you created above.

# Homebridge Installation

The setup of this is very straight forward, and requires enabling insecure mode of each homebridge instance you want to control from Alexa.

1. All homebridge instances that you want to control from Alexa need to run in insecure
mode with -I included on the command line.  How you make this change will depend on your installation of homebridge, and how you start homebridge.  If you start from the command line, it would look like this:

```
homebridge -I
```

2. Set this up as a usual plugin, except it doesn't have any devices ;-)  I'm just
reusing the runtime and configuration file management. And it only needs to installed once if you have multiple homeridge's installed.  It will autodiscover the others.
```
sudo npm install -g https://github.com/NorthernMan54/homebridge-alexa#Alexa2ndGen
```

In the event of issues or errors during install ie gyp WARN EACCES user "root" does not have permission to access the dev dir

Please try this instead

```
sudo su
sudo npm install -g —unsafe-perm https://github.com/NorthernMan54/homebridge-alexa#Alexa2ndGen
```

3. Login and password in the config.json, are the credentials you created earlier for the https://homebridge.cloudwatch.net website.

4. Restart homebridge, and ask Alexa to discovery devices.

# Upgrading from the previous version of homebridge-alexa

If you had installed the previous version of homebridge-alexa with the special version of homebridge and HAP-NodeJS, it can disabled without reinstalling homebridge.  You can disable it by removing the configuration parameter ssdp from your config.json.  This will disable the previous version.

```
"ssdp": 1900
```

# config.json

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

## Required parameters

* username - Login created for the skill linking website https://homebridge.cloudwatch.net
* password - Login created for the skill linking website https://homebridge.cloudwatch.net

## Optional parameters

* pin - If you had changed your homebridge pin from the default of "pin": "031-45-154"

# Issues, Questions or Problems

* I have created a slack channel at (https://homebridgeteam.slack.com/messages/hap-alexa/) to troubleshoot issues.

* When logging an issue, please include a DEBUG log with your issue.

```
DEBUG=alexa* homebridge -I
```

## Known Issues

* 'There was a problem' displayed in the Amazon Alexa App.  This is a known issue, and will be resolved during the beta.
* Colours not currently supported
* Blinds are not currently supported

# Previous version of homebridge-alexa

* The old version is still available and the instructions for installation can be found  [here.](V1_README.md)

# Roadmap

See https://github.com/NorthernMan54/homebridge-alexa/issues/52

# Credits

* Ben Hardill - For the inspiration behind the design.
