#!/bin/sh
DATE="$1"
DST="../.local/backup"

pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd`
popd > /dev/null

cd "$SCRIPTPATH"

# we need this because docker-compose/docker-machine does not mount ./backup in VM
rm -rf backup/latest

SRC_IMAGES="backups/images-$DATE.tar.gz"
SRC_DATABASE="backups/backup-$DATE.tar.gz"

scp $SRC_IMAGES   $DST/latest-images.tar.gz
scp $SRC_DATABASE $DST/latest-backup.tar.gz

/bin/sh scripts/restore-docker.sh

