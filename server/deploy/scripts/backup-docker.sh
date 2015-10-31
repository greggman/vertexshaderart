#!/bin/sh

# remove any previous backup
rm -f  /backup/latest-backup.tar.gz
rm -f  /backup/latest-images.tar.gz
rm -rf /backup/latest

# make mongo spit out data
echo "dump data"
docker exec c_mongo_1 mongodump --out /backup/latest

# tar up the mongo data
echo "tar mongo"
docker exec c_mongo_1 tar cvfz /backup/latest-backup.tar.gz /backup/latest/

# tar up the images
echo "tar images"
docker exec c_mongo_1 tar cvfz /backup/latest-images.tar.gz /data/images/


