#!/usr/bin/env bash

TAG=`date '+%Y-%m-%d-%H-%M-%S'`

docker build . -t hysunhe/webviewapp:${TAG}
docker tag hysunhe/webviewapp:${TAG}   hysunhe/webviewapp:latest
