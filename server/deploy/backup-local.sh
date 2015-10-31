#!/bin/sh
DOCKER=192.168.99.100
bash scripts/install-key-local.sh $DOCKER
bash scripts/backup-support.sh $DOCKER backup


