#!/bin/sh
set -e
rm -f  backups/latest-backup.tar.gz
rm -f  backups/latest-images.tar.gz
rm -rf backups/latest

echo "dump data"
../mongo/bin/mongodump -h 127.0.0.1 --port 3001 --out backups/latest
tar -s "#backups/latest/meteor#backup/latest/admin#" -s "#backups/latest#backup/latest#" -c -v -z -f backups/latest-backup.tar.gz backups/latest/
tar -s "#\\.\\./vsa-uploads#data/images#" -c -v -z -f backups/latest-images.tar.gz ../vsa-uploads/

rm -rf backups/latest

TODAY=`date +%Y-%m-%d.%H:%M:%S`
DST_IMAGES="backups/images-$TODAY-dev.tar.gz"
DST_DATABASE="backups/backup-$TODAY-dev.tar.gz"
mv backups/latest-backup.tar.gz $DST_DATABASE
mv backups/latest-images.tar.gz $DST_IMAGES


