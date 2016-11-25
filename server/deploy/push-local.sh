#!/bin/sh
DOCKER=192.168.99.100
mkdir -p files-local/config/meteor
node scripts/makesettings.js settings-local.json files-local/config/meteor/settings.env
cp docker-compose-local.yml files-local/docker-compose.yml
scp -r files-local/. $DOCKER:./files
bash scripts/install-key-local.sh $DOCKER
docker kill c_meteor_1
docker kill c_proxy
docker-compose --file files-local/docker-compose.yml up -d

