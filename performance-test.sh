#!/bin/bash
ENV_FILE=.env

if [ ! -f "$ENV_FILE" ]; then
    echo "$ENV_FILE does not exist, creating it..."
    cp .env.example $ENV_FILE
fi

# Load environment variables
source $ENV_FILE

API_PORT=$APP_PORT

# Check api port is configured
if [ -z "$API_PORT" ]
then
      echo "\$API_PORT is empty"
      exit 1
fi

# Ping to api server to check if it is up and ready
HEALTH_CHECK_URL="http://localhost:$API_PORT/api"
wget -q --spider $HEALTH_CHECK_URL 
if [ $? -ne 0 ] ; then
  echo "API server is not up and running"
  exit 1
fi

# Install dependencies in performance test folder
yarn --cwd ./test/stress/k6 install

# Run performance test
echo "=== PERFORMANCE TEST ==="
scenarios=(create-post create-order create-group-chat search-post list-online-post)
target=100

for i in "${scenarios[@]}"
do
  yarn --cwd ./test/stress/k6 $i:$target
done
