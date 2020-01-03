#!/usr/bin/env bash

docker stop webviewApp
docker rm webviewApp

docker run -d \
    --restart=always \
    --name=webviewApp \
    -p 8891:80 \
    hysunhe/webviewApp:latest
