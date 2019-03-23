var message = [];

message['{"host":"192.168.1.215","port":51826,"aid":2,"iid":10}'] = {
  endpointID: 'Q0M6MjI6M0Q6RjM6Q0U6MzctTWFnZ2llLURldi1zZW5zb3Itc3R1Yi1Nb3Rpb24=',
  true: 'DETECTED',
  false: 'NOT_DETECTED',
  template: 'MotionSensor'
};

message['{"host":"192.168.1.215","port":51826,"aid":3,"iid":10}'] = {
  '0': 'NOT_DETECTED',
  '1': 'DETECTED',
  endpointID: 'Q0M6MjI6M0Q6RjM6Q0U6MzctTWFnZ2llLURldi1zZW5zb3Itc3R1Yi1Db250YWN0',
  template: 'ContactSensor'
};

var HBMessage = [];

for (var key in message) {
  // console.log("Key", key, JSON.parse(key));
  var endpoint = JSON.parse(key);
  var register = {
    "aid": endpoint.aid,
    "iid": endpoint.iid,
    "ev": true
  };

  var x = {
    "host": endpoint.host,
    "port": endpoint.port
  };

  if (HBMessage[JSON.stringify(x)]) {
    HBMessage[JSON.stringify(x)].characteristics.push(register);
  } else {
    HBMessage[JSON.stringify(x)] = {
      "characteristics": [register]
    };
  }
}
for (var instance in HBMessage) {
  console.log("send", instance, HBMessage[instance]);
}
