#!/bin/sh
if [ -z "$2" ]
then
  echo "specify the date of the backup"
  exit 1
fi

DOCKER="$1"
DATE="$2"
DST="$3"
SRC_IMAGES="backups/images-$DATE.tar.gz"
SRC_DATABASE="backups/backup-$DATE.tar.gz"

scp $SRC_IMAGES   $DST/latest-images.tar.gz
scp $SRC_DATABASE $DST/latest-backup.tar.gz

ssh $DOCKER '/bin/sh -s' < scripts/restore-docker.sh

