#!/bin/bash

#set -e

echo "dyson_accessories"

node newParseAccessories.js ~/Code/alexaAwsBackend/samples/dyson_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/dyson.json after.json

echo "penny"

node newParseAccessories.js ~/Code/alexaAwsBackend/samples/penny_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/penny.json after.json

echo "apple_tv"

node newParseAccessories.js ~/Code/alexaAwsBackend/samples/apple_tv_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/apple_tv.json after.json

echo "apple_tv_space"

node newParseAccessories.js ~/Code/alexaAwsBackend/samples/apple_tv_space_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/apple_tv_space.json after.json

echo "mi-light"

node newParseAccessories.js ~/Code/alexaAwsBackend/samples/mi-light_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/mi-light.json after.json

echo "ikea"

node newParseAccessories.js ~/Code/alexaAwsBackend/samples/ikea_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/ikea.json after.json

echo "Sensors"

node newParseAccessories.js ~/Code/alexaAwsBackend/samples/sensor_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/sensor.json after.json

echo "Leonard"

node newParseAccessories.js ~/Code/alexaAwsBackend/samples/leonard_51827.json > after.json ; diff ~/Code/alexaAwsBackend/samples/leonard.json after.json

echo "Howard"

node newParseAccessories.js ~/Code/alexaAwsBackend/samples/howard_dump.json > after.json ; diff ~/Code/alexaAwsBackend/samples/howard.json after.json

echo "bose soundlink"

node newParseAccessories.js ~/Code/alexaAwsBackend/samples/bose_soundlink.json > after.json ; diff ~/Code/alexaAwsBackend/samples/bose.json after.json

echo "Heater Cooler"

node newParseAccessories.js ~/Code/alexaAwsBackend/samples/heater_cooler_discovery.json > after.json ; diff ~/Code/alexaAwsBackend/samples/heater.json after.json

echo "Nuki Door Lock"

node newParseAccessories.js ~/Code/alexaAwsBackend/samples/nuki_smart_lock.json > after.json ; diff ~/Code/alexaAwsBackend/samples/nuki.json after.json

echo "Yamaha - home"

node newParseAccessories.js ~/Code/alexaAwsBackend/samples/yamaha_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/yamaha.json after.json

echo "Samsung"

node newParseAccessories.js ~/Code/alexaAwsBackend/samples/samsung_tv_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/samsung_tv.json after.json

echo "Blinds etc"

node newParseAccessories.js ~/Code/alexaAwsBackend/samples/lamp_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/lamp.json after.json

echo "Cookie"

node newParseAccessories.js ~/Code/alexaAwsBackend/samples/cookie_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/cookie.json after.json

echo "Yamaha Zone Tv"

node newParseAccessories.js ~/Code/alexaAwsBackend/samples/yamaha_zone_tv_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/yamaha_zone_tv.json after.json

echo "Nest"

node newParseAccessories.js ~/Code/alexaAwsBackend/samples/nest_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/nest.json after.json

echo "LG TV/Issue #284"

node newParseAccessories.js ~/Code/alexaAwsBackend/samples/issue_284.json > after.json ; diff ~/Code/alexaAwsBackend/samples/issue_284_alexa.json after.json

echo "Test successfully completed"
