#!/bin/sh
DOCKER=192.168.99.100
bash scripts/install-key-local.sh $DOCKER
node scripts/makesettings.js settings-local.json settings/settings-local.env
docker kill c_meteor_1
docker-compose --file docker-compose-local.yml up -d

