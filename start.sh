#!/usr/bin/env bash

docker run -d \
    --restart=always \
    --name=odaqr-webview \
    -p 8891:80 \
    hysunhe/odaqr-webview:latest
