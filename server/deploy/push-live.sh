#!/bin/sh
DOCKER=vertexshaderart.com
# change to tar with d-tar? Can even pipe it?
mkdir -p files-live/config/meteor
node scripts/makesettings.js settings-live.json files-live/config/meteor/settings.env
cp docker-compose-live.yml files-live/docker-compose.yml
scp -r files-live/. $DOCKER:./files
ssh $DOCKER 'bash -s' < scripts/deploy-live.sh

