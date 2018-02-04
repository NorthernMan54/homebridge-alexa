# Deployer script for web site

echo "Hello World"

pkill node
rm -rf awsWeb
mkdir awsWeb
cd awsWeb
unzip ../homebridgeWeb.zip
npm install
sudo systemctl restart apache2
./startup
