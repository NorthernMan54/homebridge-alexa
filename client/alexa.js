/**
 * Copyright 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {

    "use strict";
    var request = require('request');
    var mqtt = require('mqtt');
    var bodyParser = require('body-parser');

    var devicesURL = 'https://alexa-node-red.bm.hardill.me.uk/api/v1/devices';


    var devices = {};

    function alexaConf(n) {
    	RED.nodes.createNode(this,n);
    	this.username = n.username;
    	this.password = this.credentials.password;

        this.users = {};

    	var node = this;

        var options = {
            username: node.username,
            password: node.password,
            clientId: node.username,
            reconnectPeriod: 5000,
            servers:[
                {
                    protocol: 'mqtts',
                    host: 'alexa-node-red.hardill.me.uk',
                    port: 8883
                },
                {
                    protocol: 'mqtt',
                    host: 'alexa-node-red.hardill.me.uk',
                    port: 1883
                }
            ]
        };

        // if (process.env.DEBUG) {
        //     console.log("debug");
        //     process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        //     var test = {
        //         protocol: 'mqtt',
        //         host: '172.17.0.2',
        //         port: 1883
        //     };
        //     options.servers = [test];

        //     devicesURL = 'https://localhost:3000/api/v1/devices'
        // }

        getDevices(node.username, node.password, node.id);

        this.connect = function() {
            node.client = mqtt.connect(options);
            node.client.setMaxListeners(0);

            node.client.on('connect', function() {
                node.setStatus({text:'connected', shape:'dot', fill:'green'});
                node.client.removeAllListeners('message');
                node.client.subscribe("command/" + node.username + "/#");
                node.client.on('message', function(topic, message){
                    var msg = JSON.parse(message.toString());
                    var applianceId = msg.payload.appliance.applianceId;
                    for (var id in node.users) {
                        if (node.users.hasOwnProperty(id)){
                            if (node.users[id].device === applianceId) {
                                node.users[id].command(msg);
                            }
                        }
                    }
                });
            });

            node.client.on('offline',function(){
                node.setStatus({text: 'disconnected', shape: 'dot', fill:'red'});
            });

            node.client.on('reconnect', function(){
                node.setStatus({text: 'reconnecting', shape: 'ring', fill:'red'});
            });

            node.client.on('error', function (err){
                //console.log(err);
                node.setStatus({text: 'disconnected', shape: 'dot', fill:'red'});
                node.error(err);
            });
        }

        this.setStatus = function(status) {
            for( var id in node.users) {
                if (node.users.hasOwnProperty(id)) {
                    node.users[id].status(status);
                }
            }
        }

        this.register = function(deviceNode) {
            node.users[deviceNode.id] = deviceNode;
            if (Object.keys(node.users).length === 1) {
                //connect
                node.connect();
            }
        };

        this.deregister = function(deviceNode, done) {
            delete node.users[deviceNode.id];

            if (Object.keys(node.users).length === 0) {
                //disconnect
                if (node.client && node.client.connected) {
                    node.client.end(done);
                } else {
                    node.client.end();
                    done();
                }
            }

            done();
        };

        this.acknoledge = function(messageId, device, success, extra) {
            var response = {
                messageId: messageId,
                success: success
            };

            if (extra) {
                response.extra = extra;
            }

            // console.log("response: " + response);

            var topic = 'response/' + node.username + '/' + device;
            if (node.client && node.client.connected) {
                node.client.publish(topic, JSON.stringify(response));
            }
        };

    	this.on('close',function(){
            if (node.client && node.client.connected) {
                node.client.end();
            }
            //node.removeAllListeners();
    		//delete devices[node.id];
    	});
    };

    RED.nodes.registerType("alexa-home-conf",alexaConf,{
        credentials: {
            password: {type:"password"}
        }
    });

    function alexaHome(n) {
    	RED.nodes.createNode(this,n);
    	this.conf = RED.nodes.getNode(n.conf);
        this.confId = n.conf;
    	this.device = n.device;
        this.topic = n.topic;
        this.acknoledge = n.acknoledge;
        this.name = n.name;

    	var node = this;

        node.command = function (message){
            var msg ={
                topic: node.topic || "",
                name: node.name,
                _messageId: message.header.messageId,
                _applianceId: message.payload.appliance.applianceId,
                _confId: node.confId,
                command: message.header.name,
                extraInfo: message.payload.appliance.additionalApplianceDetails
            }

            var responseExtra;
            var respond = true;

            switch(message.header.name){
                case "TurnOnRequest":
                    msg.payload = true;
                    break;
                case "TurnOffRequest":
                    msg.payload = false;
                    break;
                case "SetPercentageRequest":
                    msg.payload = message.payload.percentageState.value;
                    break;
                case "IncrementPercentageRequest":
                    msg.payload = message.payload.deltaPercentage.value;
                    break;
                case "DecrementPercentageRequest":
                    msg.payload = -1 * message.payload.deltaPercentage.value;
                    break;
                case "SetTargetTemperatureRequest":
                    msg.payload = message.payload.targetTemperature.value;
                    responseExtra = {
                        targetTemperature: {
                            value: message.payload.targetTemperature.value
                        }
                    };
                    break;
                case "IncrementTargetTemperatureRequest":
                    msg.payload = message.payload.deltaTemperature.value;
                    responseExtra = {
                        targetTemperature: {
                            value: message.payload.targetTemperature.value
                        }
                    };
                    break;
                case "DecrementTargetTemperatureRequest":
                    msg.payload = -1 * message.payload.deltaTemperature.value;
                    responseExtra = {
                        targetTemperature: {
                            value: message.payload.targetTemperature.value
                        }
                    };
                    break;
                case "SetLockStateRequest":
                    msg.payload = message.payload.lockState;
                    responseExtra = {
                        lockState: message.payload.lockState
                    }
                    break;
                case "SetColorRequest":
                    msg.payload = message.payload.color;
                    responseExtra = {
                        achievedState: {
                            color: message.payload.color
                        }
                    };
                    break;
                case "SetColorTemperatureRequest":
                    msg.payload = message.payload.colorTemperature.value;
                    responseExtra = {
                        achievedState: message.payload
                    }
                    //respond = false;
                    break;
                case "IncrementColorTemperatureRequest":
                    msg.payload = message.payload
                    respond = false;
                    break;
                case "decrementColorTemperatureRequest":
                    msg.payload = message.payload;
                    respond = false;
                    break;
                case "GetLockStateRequest":
                case "GetTemperatureReadingRequest":
                case "GetTargetTemperatureRequest":
                    respond = false;
                    break;
            }

            node.send(msg);
            if (node.acknoledge && respond) {
                node.conf.acknoledge(message.header.messageId, node.device, true, responseExtra);
            }
        }

        node.conf.register(node);

        node.on('close', function(done){
            node.conf.deregister(node, done);
        });

    }


    RED.nodes.registerType("alexa-home", alexaHome);

    function alexaHomeResponse(n) {
        RED.nodes.createNode(this,n);

        var node = this;

        node.on('input',function(msg){
            if (msg._messageId && msg._applianceId && msg._confId) {
                var conf = RED.nodes.getNode(msg._confId);
                if (typeof msg.payload == 'boolean' && msg.payload) {
                    conf.acknoledge(msg._messageId, msg._applianceId, true, msg.extra);
                } else {
                    conf.acknoledge(msg._messageId, msg._applianceId, false, msg.extra);
                }
            }

        });
    }

    RED.nodes.registerType("alexa-home-resp", alexaHomeResponse);

    RED.httpAdmin.use('/alexa-home/new-account',bodyParser.json());

    function getDevices(username, password, id){
        if (username && password) {
            request.get({
                url: devicesURL,
                auth: {
                    username: username,
                    password: password
                }
            }, function(err, res, body){
                if (!err && res.statusCode == 200) {
                    var devs = JSON.parse(body);
                    //console.log(devs);
                    devices[id] = devs;
                } else {
                    //console.("err: " + err);
                    RED.log.log("Problem looking up " + username + "'s devices");
                }
            });
        }
    };

    RED.httpAdmin.post('/alexa-home/new-account',function(req,res){
    	//console.log(req.body);
    	var username = req.body.user;
    	var password = req.body.pass;
    	var id = req.body.id;
    	getDevices(username,password,id);
    });

    RED.httpAdmin.post('/alexa-home/refresh/:id',function(req,res){
        var id = req.params.id;
        var conf = RED.nodes.getNode(id);
        if (conf) {
            var username = conf.username;
            var password = conf.credentials.password;
            getDevices(username,password,id);
            res.status(200).send();
        } else {
            //not deployed yet
            console.log("Can't refresh until deployed");
            res.status(404).send();
        }
    });

    RED.httpAdmin.get('/alexa-home/devices/:id',function(req,res){
    	if (devices[req.params.id]) {
    		res.send(devices[req.params.id]);
    	} else {
    		res.status(404).send();
    	}
    });


};