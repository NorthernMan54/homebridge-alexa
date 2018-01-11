
# homebridge-alexa

These are my notes and backlog for the creating of the Skill Based approach for integrating Amazon Alexa with HomeBridge.

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


# backlog

## Alexa Lambda HomeSkill

* Create Alexa homeskill to interface between Lambda and the Website
* Pass Homeskill message to website

## Create website to give homebridge an endpoint to connect to

* Create website
* Create Authentication model to link Alexa skill to homebridge plugin
* Pass Homeskill message to homebridge-plugin

## Homebridge-Alexa

* Create plugin the opens a websocket to the website in Amazon S3 Cloud
* Create handler for Alexa homeskill message

## HAPNode-JS

* Determine method for accessing accessories in HAPNode-JS

## Accessory Types

* Light
