#!/usr/bin/env bash

TAG=`date '+%Y-%m-%d-%H-%M-%S'`

docker build . -t hysunhe/odaqr-webview:${TAG}
docker tag hysunhe/odaqr-webview:${TAG}   hysunhe/odaqr-webview:latest
