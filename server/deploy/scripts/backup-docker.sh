#!/bin/sh
SRC="$1"

# remove any previous backup
rm -f  "$SRC/backup/latest-backup.tar.gz"
rm -f  "$SRC/backup/latest-images.tar.gz"
rm -rf "$SRC/backup/latest"

# make mongo spit out data
echo "dump data"
docker exec c_mongo_1 mongodump --out /backup/latest

# tar up the mongo data
echo "tar mongo"
docker exec c_mongo_1 tar cvfz /backup/latest-backup.tar.gz /backup/latest/

# tar up the images
echo "tar images"
docker exec c_mongo_1 tar cvfz /backup/latest-images.tar.gz /data/images/


