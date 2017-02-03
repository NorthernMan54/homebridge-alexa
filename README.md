# alexahome

# Amazon Alexa Configuration

1. Setup the Amazon environment by following these steps, except for a couple of things.

http://blog.thescorpius.com/index.php/2016/11/19/control-x10-amazon-echo-smart-home-skill

2. Use the code fragment from aws/lambda_function.js instead of the example given.

3. You can skip the steps around installing apache and the php components, this uses
the nodejs instance that is running homebridge.

4. Homebridge needs to run in insecure mode with -I included on the command line.

5. Set this up as a usual plugin, except it doesn't have any devices ;-)  I'm just
reusing the runtime and configuration file management. Also code management with nodejs
is easier than apache/php.

# config.json

```
{
"platform": "Alexa",
     "name": "Alexa",
"port": 8082
} ```

# Credits
* TheScorpius666
