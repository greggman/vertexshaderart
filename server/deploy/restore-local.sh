#!/bin/sh
DOCKER=192.168.99.100
DATE="$1"
bash scripts/install-key-local.sh $DOCKER

# we need this because docker-compose/docker-machine does not mount ./backup in VM
rm -rf backup/latest

bash scripts/restore-support.sh $DOCKER "$DATE" backup

