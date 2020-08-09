#! /bin/sh

# Run a peer-server to broker connections with WebRTC
# https://github.com/peers/peerjs-server

docker run --name peerjs -p 9001:9000 -d peerjs/peerjs-server --port 9000 --path /buttonie
