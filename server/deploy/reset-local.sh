#!/bin/sh
docker kill c_meteor_1 c_mongo_1 c_proxy
docker rm c_meteor_1 c_mongo_1
docker volume rm local_data-volume
