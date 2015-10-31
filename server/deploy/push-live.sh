#!/bin/sh
DOCKER=vertexshaderart.com
# change to tar with d-tar? Can even pipe it?
node scripts/makesettings.js settings-live.json settings/settings-live.env
scp settings/settings-live.env $DOCKER:./settings.env
scp docker-compose-live.yml $DOCKER:.
ssh $DOCKER 'bash -s' < scripts/deploy-live.sh

