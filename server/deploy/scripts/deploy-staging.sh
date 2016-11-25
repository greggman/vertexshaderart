#!/bin/sh
docker kill c_meteor_1
docker kill c_proxy
docker-compose --file ./docker-compose.yml up -d

