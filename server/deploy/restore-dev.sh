#!/bin/sh
if [ -z "$1" ]
then
  echo "specify the date of the backup"
  exit 1
fi
set -e

rm -rf backups/latest

DATE="$1"
SRC_IMAGES="backups/images-$DATE.tar.gz"
SRC_DATABASE="backups/backup-$DATE.tar.gz"
cp $SRC_IMAGES   backups/latest-images.tar.gz
cp $SRC_DATABASE backups/latest-backup.tar.gz

tar -s "#backup/latest/admin#backups/latest/meteor#" -s "#backup/latest#backups/latest#" -x -v -z -f backups/latest-backup.tar.gz
tar -s "#data/images#vsa-uploads#" -P -x -v -z -f backups/latest-images.tar.gz -C ..

../mongo/bin/mongorestore -h 127.0.0.1 --port 3001 --drop backups/latest

rm -rf backups/latest
rm -f  backups/latest-images.tar.gz
rm -f  backups/latest-backup.tar.gz

