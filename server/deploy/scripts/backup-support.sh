#!/bin/sh
DOCKER="$1"
SRC="$2"
TODAY=`date +%Y-%m-%d.%H-%M-%S`
DST_IMAGES="backups/images-$TODAY.tar.gz"
DST_DATABASE="backups/backup-$TODAY.tar.gz"
if [[ -z "$DOCKER" ]]; then
  # local
  /bin/sh scripts/backup-docker.sh "$SRC"
else
  # remote
  ssh $DOCKER '/bin/sh -s' < scripts/backup-docker.sh
fi
scp $SRC/latest-backup.tar.gz $DST_DATABASE
scp $SRC/latest-images.tar.gz $DST_IMAGES
echo backed up to $DST_DATABASE and $DST_IMAGES


