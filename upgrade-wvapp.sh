#!/usr/bin/env bash

echo "Deleting old code..."
rm -rf /home/oracle/hysun-workspace/webviewApp

sleep 1

echo "pull latest code"
cd /home/oracle/hysun-workspace
git clone https://github.com/HysunHe/webviewApp.git

sleep 1

echo "npm install webviewApp"
cd /home/oracle/hysun-workspace/webviewApp/
chmod +x *.sh
npm install
npm run build

sleep 1

echo "Producing new image..."
./build-image.sh

sleep 1

echo "Starting odaqr..."

./start.sh

sleep 1

echo "Done!"

cd