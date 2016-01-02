#!/bin/sh
DOCKER=staging.vertexshaderart.com
# change to tar with d-tar? Can even pipe it?
node scripts/makesettings.js settings-staging.json settings/settings-staging.env
scp settings/settings-staging.env $DOCKER:./settings.env
scp docker-compose-staging.yml $DOCKER:.
ssh $DOCKER 'bash -s' < scripts/deploy-staging.sh

