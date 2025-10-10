#!/bin/bash

cp .env.example .env

rm -rf node_modules

docker-compose --env-file .env -f ./deployments/docker-compose.yml down --volumes

docker-compose --env-file .env -f ./deployments/docker-compose.yml up -d

yarn setup
