
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

# Backlog

## Alexa Lambda HomeSkill

* [ ] Create Alexa homeskill to interface between Lambda and the Website
* [ ] Pass Homeskill message to website

## Create website to give homebridge an endpoint to connect to

* [ ] Create website
* [ ] Create Authentication model to link Alexa skill to homebridge plugin
* [ ] Pass Homeskill message to homebridge-plugin

## Homebridge-Alexa

* [ ] Create plugin the opens a websocket to the website in Amazon S3 Cloud
* [ ] Create handler for Alexa homeskill message

## HAPNode-JS

* [ ] Determine method for accessing accessories in HAPNode-JS

## Accessory Types

* [ ] Light

# Credits

* Ben Hardill - For the inspiration behind the design.
