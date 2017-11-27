#!/bin/sh
mkdir -p files-local/config/meteor
node scripts/makesettings.js settings-local.json files-local/config/meteor/settings.env
cp docker-compose-local.yml files-local/docker-compose.yml
cp -r files-local/. ../.local
docker kill c_meteor_1
docker kill c_proxy
docker-compose --file ../.local/docker-compose.yml up -d

