#!/usr/bin/env bash

case "$OSTYPE" in
  linux*)
    bash ./linux/centos.sh
    ;;
  *)
    echo "Unsupported for os version: $OSTYPE"
    ;;
esac
