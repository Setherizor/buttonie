# Buttonie

a group game about pressing eachother's right buttons

## Important Links

- [AlpineJS](https://github.com/alpinejs/alpine#learn)
- [Alpint Test Utils](https://github.com/HugoDF/alpine-test-utils#quick-start-write-your-first-test)
- [PeerJS](https://peerjs.com/docs.html#api)
- [Notyf](https://github.com/caroso1222/notyf)

## Setup Paths

### Hosts

1. `await` Broker Identity (**room** based)
2. setup room peer, setup **peer** listeners, handle incoming connections
3. (_on connection_) evaluate connection, setup **connection** listeners
4. (_on close_) broadcast leave, remove connection from list

### Clients

1. `await` Broker Identity (**username** based)
2. setup client peer, setup **peer** listeners
3. `await` attempt to join room peer by given ID
4. handle possible rejectsions, and then join room
