#!/bin/sh
DOCKER=staging.vertexshaderart.com
# change to tar with d-tar? Can even pipe it?
mkdir -p files-staging/config/meteor
node scripts/makesettings.js settings-staging.json files-staging/config/meteor/settings.env
cp docker-compose-staging.yml files-staging/docker-compose.yml
rsync -avW files-live/ $DOCKER:./files
rsync -avW ../.build/ $DOCKER:./build
ssh $DOCKER 'bash -s' < scripts/deploy-staging.sh

