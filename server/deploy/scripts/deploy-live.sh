#!/bin/sh
docker kill c_meteor_1
docker kill c_nginx
docker-compose --file ./docker-compose-live.yml up -d

