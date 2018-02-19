# homebridge-alexa

Enable access to you homebridge controlled devices and accessories via Amazon Alexa.  Full support for all Amazon Alexa devices.

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
accessories are not supported, and can not be supported.

# Voice commands supported

* Alexa, turn on the _______
* Alexa, turn off the _______
* Alexa, set ______ to number percent

# Homebridge Installation

The setup of this is very straight forward, and requires enabling insecure mode of each homebridge instance you want to control from Alexa.

1. All homebridge instances that you want to control from Alexa need to run in insecure
mode with -I included on the command line.

2. Set this up as a usual plugin, except it doesn't have any devices ;-)  I'm just
reusing the runtime and configuration file management. Also code management with nodejs
is easier than apache/php.

npm install -g https://github.com/NorthernMan54/homebridge-alexa#Alexa2ndGen

# Alexa Home Skill configuration

1. Create an account for yourself at https://homebridge.cloudwatch.net

2. Search for the homebridge skill on the Alexa App/Web site, and link you Amazon account to the account you created above.

# Getting access to the Alexa homebridge-alexa homeskill beta

## Send me a direct message at NorthernMan54 with your amazon login, via the homebridge slack site.

# config.json

```
{
    "platform": "Alexa",
    "name": "Alexa",
    "username": "....",
    "password": "...."
  }
```
## Optional parameters

* pin - If you had changed your pin from the default of "pin": "031-45-154"

# Roadmap

See https://github.com/NorthernMan54/homebridge-alexa/issues#47

# Credits

* Ben Hardill - For the inspiration behind the design.
