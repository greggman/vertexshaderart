#!/bin/sh
DOCKER="$1"
SRC="$2"
TODAY=`date +%Y-%m-%d.%H:%M:%S`
DST_IMAGES="backups/images-$TODAY.tar.gz"
DST_DATABASE="backups/backup-$TODAY.tar.gz"
ssh $DOCKER '/bin/sh -s' < scripts/backup-docker.sh
scp $SRC/latest-backup.tar.gz $DST_DATABASE
scp $SRC/latest-images.tar.gz $DST_IMAGES


