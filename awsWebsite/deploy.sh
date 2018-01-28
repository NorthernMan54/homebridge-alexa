# Deployer script for web site

echo "Hello World"

pkill node
rm -rf awsWeb
mkdir awsWeb
cd awsWeb
unzip ../homebridgeWeb.zip
npm install
sudo /opt/bitnami/ctlscript.sh restart apache
DEBUG=* node index.js
