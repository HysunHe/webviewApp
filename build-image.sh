#!/usr/bin/env bash

TAG=`date '+%Y-%m-%d-%H-%M-%S'`

docker build . -t hysunhe/webviewApp:${TAG}
docker tag hysunhe/webviewApp:${TAG}   hysunhe/webviewApp:latest
