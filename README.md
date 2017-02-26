# homebridge-alexa

## I have abandoned this approach for Alexa Integration due to the complexity of
configuration and requiring to poke holes into your firewall etc.  I have now switched
my efforts to utilizing HA-Bridge as the integration approach and have started this
repository to store the code etc.  https://github.com/NorthernMan54/homebridge-alexabridge

Amazon Alexa to homebridge interface.   Using the insecure mode of Homebridge ( -I )
to bridge from Amazon Alexa to homebridge.  Homebridge instances are autodiscovered
at startup by looking for 'hap' devices.   This is an alpha release of code, and
includes minimal error and status handling.  

* Supports multiple homebridge instances running on your network.
* Homebridge autodiscovery to minimize entries in config.json
* Supports devices of homekit Service type Lightbulb, Outlet, and Switch
* If device supports the 'Brightness Characteristic', then the ability to set a
brightness is included.
* This plugin does not have any devices or accessories that are visible from Homekit,
and does not need to be added on the Home app.
* The plugin does not need to be installed in your 'main' homebridge instance.  It
can be installed in a standalone 'Homebridge' instance beside your main instance.

Alexa device names are the same as the homebridge device names.

This only supports  accessories connected via a homebridge plugin, any 'Homekit'
accessories are not supported, and can not be supported.

# Voice commands supported

* Alexa, turn on the _______
* Alexa, turn off the _______
* Alexa, set ______ to number percent

# Amazon Alexa Configuration

The setup of this is quite advanced, and requires creating Amazon developer accounts
and making changes to your router.  Unless you are comfortable with these steps,
I would not recommend proceeding with these steps.

Also these steps require exposing a portion of your network to the internet
as whole. Before proceeding, please ensure you understand what this means, and what
risks you are taking on.

These steps are just an addition to this blog, and are not the detailed instructions
you need to follow.

1. Setup the Amazon environment by following these steps, except for a couple of things.

http://blog.thescorpius.com/index.php/2016/11/19/control-x10-amazon-echo-smart-home-skill

2. Use the code fragment from aws/lambda_function.js instead of the example given.
Change hostname and port to match your configuration.

3. You can skip the steps around installing apache and the php components, this uses
the nodejs instance that is running homebridge.

4. All homebridge instances that you want to control from Alexa need to run in insecure
mode with -I included on the command line.

5. Set this up as a usual plugin, except it doesn't have any devices ;-)  I'm just
reusing the runtime and configuration file management. Also code management with nodejs
is easier than apache/php.

npm install -g https://github.com/NorthernMan54/homebridge-alexa

# config.json

```
{
"platform": "Alexa",
     "name": "Alexa",
     "port": 8082
}
```

# Roadmap

* Use websockets to avoid making firewall changes to support connectivity from Amazon
to homebridge
* Switch to https for communications between Amazon and Homebridge Alexa
* Cleanup technical debit in Amazon lambda_function.js, and externalize configuration items.

# Credits
* TheScorpius666
