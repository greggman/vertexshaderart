#!/bin/sh
docker kill c_meteor_1
docker kill c_proxy
(cd build/bundle/programs/server && npm install)
docker-compose --file ./files/docker-compose.yml up -d

