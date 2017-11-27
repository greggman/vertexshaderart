#!/bin/sh

# remove any previous backup
docker exec c_mongo_1 rm -rf backup/latest

# untar the data
docker exec c_mongo_1 tar xvfz backup/latest-backup.tar.gz
docker exec c_mongo_1 tar xvfz backup/latest-images.tar.gz -C /

# copy the data into mongo
docker exec c_mongo_1 mongorestore --drop -d admin backup/latest/admin

# remove the backup
docker exec c_mongo_1 rm -f  backup/latest-backup.tar.gz
docker exec c_mongo_1 rm -f  backup/latest-images.tar.gz
docker exec c_mongo_1 rm -rf backup/latest

