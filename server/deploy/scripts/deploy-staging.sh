#!/bin/sh
docker kill c_meteor_1
docker-compose --file ./docker-compose-staging.yml up -d

