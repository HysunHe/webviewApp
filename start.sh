#!/usr/bin/env bash

docker stop webviewapp
docker rm webviewapp

docker run -d \
    --restart=always \
    --name=webviewapp \
    -p 8891:80 \
    hysunhe/webviewapp:latest
