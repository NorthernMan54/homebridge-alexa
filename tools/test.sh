echo "dyson_accessories"

node parseAccessories.js ~/Code/alexaAwsBackend/samples/dyson_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/dyson.json after.json

echo "penny"

node parseAccessories.js ~/Code/alexaAwsBackend/samples/penny_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/penny.json after.json

echo "apple_tv"

node parseAccessories.js ~/Code/alexaAwsBackend/samples/apple_tv_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/apple_tv.json after.json

echo "mi-light"

node parseAccessories.js ~/Code/alexaAwsBackend/samples/mi-light_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/mi-light.json after.json

echo "ikea"

node parseAccessories.js ~/Code/alexaAwsBackend/samples/ikea_accessories.json > after.json ; diff ~/Code/alexaAwsBackend/samples/ikea.json after.json
