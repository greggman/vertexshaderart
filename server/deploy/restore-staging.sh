#!/bin/sh
DOCKER=staging.vertexshaderart.com
DATE="$1"
bash scripts/restore-support.sh $DOCKER "$DATE" "$DOCKER:backup"

