#! /bin/sh

# Check that peer-server is alive and ready to broker connections with WebRTC
# https://github.com/peers/peerjs-server
# Configuration for this is in the repo for my swarm configuration

curl -k https://p2p.sethp.cc/buttonie
echo ""

# Deprecated
# docker run --name peerjs -p 9001:9000 -d peerjs/peerjs-server --port 9000 --path /buttonie
