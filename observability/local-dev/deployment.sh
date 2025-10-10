#!/usr/bin/env bash

CP .env.example .env

# Start docker servers
docker-compose --env-file .env -f local.yaml up -d
