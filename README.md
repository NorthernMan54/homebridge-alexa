
# homebridge-alexa

These are my notes and backlog for the creating of the Skill Based approach for integrating Amazon Alexa with HomeBridge.  Also all code for this version will use this branch of the repository.

# Design

          -------------------
          | Alexa HomeSkill |
          -------------------
                  |
                 \|/
          -------------------
          | website         |
          -------------------
                 /|\
                  |
          ---------------------
          | Homebridge Plugin |
          ---------------------
          | HAPNodeJS         |
          ---------------------

My inspiration for the design is based on the work done to create a Alexa Skill for Node Red by Ben Hardill.  You read the details here: http://www.hardill.me.uk/wordpress/2016/11/05/alexa-home-skill-for-node-red/

# backlog

Moved to https://github.com/NorthernMan54/homebridge-alexa/issues/47

# Setup Development Toolchain

## Alexa Lambda HomeSkill

* Followed this - https://developer.amazon.com/blogs/post/Tx1UE9W1NQ0GYII/Publishing-Your-Skill-Code-to-Lambda-via-the-Command-Line-Interface

## aws LightSail web website

* followed tutorial
* then used this to link apache to nodejs https://docs.bitnami.com/aws/components/nodejs/
* Installed MongoDB

```
sudo apt-get install mongodb mosquitto
```

* Registered IP Address at freeDNS - homebridge.cloudwatch.net
* Create SSL at Let's Encrypt

```
sudo apt-get update
sudo apt-get install software-properties-common
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install python-certbot-apache
sudo /opt/bitnami/ctlscript.sh stop apache
sudo certbot certonly
  2
  homebridge.cloudwatch.net

- Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/homebridge.cloudwatch.net/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/homebridge.cloudwatch.net/privkey.pem
   Your cert will expire on 2018-04-28. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot
   again. To non-interactively renew *all* of your certificates, run
   "certbot renew"

From https://docs.bitnami.com/google/how-to/generate-install-lets-encrypt-ssl/

sudo mv /opt/bitnami/apache2/conf/server.crt /opt/bitnami/apache2/conf/server.crt.old
sudo mv /opt/bitnami/apache2/conf/server.key /opt/bitnami/apache2/conf/server.key.old
sudo mv /opt/bitnami/apache2/conf/server.csr /opt/bitnami/apache2/conf/server.csr.old
sudo ln -s /etc/letsencrypt/live/homebridge.cloudwatch.net/privkey.pem /opt/bitnami/apache2/conf/server.key
sudo ln -s /etc/letsencrypt/live/homebridge.cloudwatch.net/fullchain.pem /opt/bitnami/apache2/conf/server.crt
sudo chown root:root /opt/bitnami/apache2/conf/server*
sudo chmod 600 /opt/bitnami/apache2/conf/server*
sudo /opt/bitnami/ctlscript.sh start
```

## Local version of awsWebsite

```
brew install mongo; brew services start mongodb
brew install mosquitto; brew services start mosquitto
```
# Credits

* Ben Hardill - For the inspiration behind the design.
