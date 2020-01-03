# Build and remote deployment.

npm run build

./build-image.sh

docker push hysunhe/webviewApp:latest

ssh -i /home/hysun/projects/BetterBot/credentials/sehub/id_rsa opc@o100.odainfra.com -t "sudo su - oracle -c ./upgrade-wvapp.sh"
