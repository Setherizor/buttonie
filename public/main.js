function data () {
  return {
    // Dynamic Data
    messages: [],
    alerts: [],
    // Form Data
    roomcode: 'YEET', // for now room codes are just other's usernames
    username: window.location.hash.slice(1) || '',
    message: '',
    // Status Data
    peer: null,
    connections: [],
    ingame: false,
    isHost: false,
    // Static data for convenience
    navLinks: [
      {
        title: 'Play',
        href: '#'
      },
      {
        title: 'About',
        href: '#'
      },
      {
        title: 'Github',
        href: 'https://github.com/Setherizor/buttonie'
      }
    ],
    buttons: [
      {
        title: 'Blank',
        class: ''
      },
      {
        title: 'Possible',
        class: 'background-secondary'
      },
      {
        title: 'Weary',
        class: 'background-success'
      },
      {
        title: 'Other',
        class: 'background-danger'
      },
      {
        title: 'Down',
        class: 'background-warning'
      },
      {
        title: 'Online',
        class: 'background-secondary'
      },
      {
        title: 'Almost',
        class: 'background-muted'
      }
    ],

    // More Functions Defined in `functions.js`

    // Ran on page load
    created () {
      // Create an instance of Notyf
      this.notyf = new Notyf({
        duration: 5000,
        dismissible: true
      })
    },
    /**
     * Scroll message pane down
     */
    scrollMessages () {
      setTimeout(() => {
        let m = document.getElementById('messages')
        m.scrollTop = m.scrollHeight
      }, 100)
    },
    /**
     * Serve as generic status update handler
     */
    statusUpdate (status) {
      broadcast(
        this.connections,
        this.isHost ? 'server' : this.username,
        status
      )
    },
    /**
     * As peer, just write to page
     * As host, repeat to all but sending peer
     */
    messageHandler (message) {
      if (this.isHost) broadcast(this.connections, message.from, message.data)

      // Scroll down
      this.messages.push(message)
      this.scrollMessages()
    },
    /**
     * Setup new incoming connections
     * AS A HOST
     */
    incomingConnectionHandler (conn) {
      // Do validity & sanity checks on incoming connections

      // Do not let connections in with taken names
      if (conn.metadata.username == this.username) {
        console.log(
          'incoming connection denied due to name conflict with ' +
            this.username
        )
        conn.on('open', () => {
          conn.send({ err: 'Name already taken in room' })
          // Kill connection if it does not go away in time
          setTimeout(() => {
            if (conn.open) {
              console.log('Connection forcefull closed after rejection message')
              conn.close()
            }
          }, 2000)
        })
        return // early exit
      }

      // Setup event listeners

      // data is launched when you receive a message
      conn.on('data', data => this.messageHandler(data))

      // open is launched when the connection is ready to use
      conn.on('open', () => {
        console.log('connection opened:', conn.label)
        this.statusUpdate(
          `${conn.metadata.username} has joined to ${conn.metadata.room}`
        )
      })

      // detect when a connection is closed (won't work in Firefox)
      conn.on('close', () => {
        console.warn('connection closed:', conn.label)
        //TODO: remove closed connections, be smarter about this
        this.connections = this.connections.filter(c => c.open)
        this.statusUpdate(`${conn.metadata.username} has left to ${conn.peer}`)
      })

      // catch all
      conn.on('error', e => console.error('Connection error:', e))

      // Add to host's connections
      this.connections.push(conn)
      console.log('added connection', this.connections)
    },
    /**
     * Attempt to join a room and setup the connection
     * AS A CLIENT
     */
    connectToRoom (roomID, peerID) {
      // to resolve this, we need to not only connect, but also receive confirmation
      return new Promise((resolve, reject) => {
        let conn = this.peer.connect(roomID, {
          label: peerID + '-connection',
          metadata: {
            username: peerID,
            room: roomID
          }
        })

        // Setup event listeners

        // open is launched when the connection is ready to use
        conn.on('open', () => {
          console.log('connection to room opened: ', conn.metadata)
          this.statusUpdate(
            `${conn.metadata.username} has joined to ${conn.metadata.room}`
          )
        })

        // data is launched when you receive a message
        conn.on('data', data => {
          if (data.err) return reject({ message: data.err, connection: conn })

          this.messageHandler(data)

          if (data.data.includes('has joined to')) return resolve(conn)
        })

        // detect when a connection is closed (won't work in Firefox)
        conn.on('close', () => {
          let errorMessage = 'connection closed: ' + conn.label
          console.warn(errorMessage)
          this.notyf.error(errorMessage)
        })

        // catch all
        conn.on('error', e => console.error('Connection error:', e))
      })
    },

    /**
     * Join broker server with a given ID
     */
    broker (peerID, asHost) {
      return new Promise((resolve, reject) => {
        if (this.peer) reject('refresh page, registration mismatch')
        // TODO use /peers to discover existing rooms
        let peer = new Peer(peerID, {
          host: 'p2p.sethp.cc',
          path: '/buttonie',
          secure: true,
        })

        peer.on('open', id => resolve(peer))

        // Decide what to do with incoming connections
        peer.on('connection', conn => {
          if (asHost)
            // Connection handling is only for hosts
            this.incomingConnectionHandler(conn)
          else this.notyf.error('someone tried to connect to you?')
        })

        peer.on('close', () => console.log('peer closed:', peer))

        peer.on('disconnected', () => console.log('peer disconnected', peer))

        peer.on('error', err => reject(err))
      })
    },
    /**
     * Host a gameroom
     */
    async host (roomID, peerID) {
      let id = this.username
      let room = this.roomcode

      // Handle possible outcomes as a room host
      try {
        this.peer = await this.broker(room, true)

        console.log('brokered as:', id, this.peer)
        this.notyf.success('room hosted, awaiting peers...')
      } catch (err) {
        let errorMessage = err.toString().replace('ID', 'room')
        console.error(errorMessage)
        this.notyf.error(errorMessage)
        return
      }

      this.isHost = true
      this.ingame = true
    },
    /**
     * Join the gameroom
     */
    async join () {
      let id = this.username
      let room = this.roomcode

      // Close current connections
      if (this.peer) {
        this.notyf.error('refresh page, registration mismatch')
        return
      }

      try {
        // Join the connection broker (PeerServer)
        this.peer = await this.broker(id + '-peer')
        console.log('registered as:', id, this.peer)

        // Join the room (through the host peer)
        let conn = (this.connections[0] = await this.connectToRoom(room, id))
        console.log('finished connecting to:', conn.peer)

        this.ingame = true

        let successMessage = `connected to ${conn.metadata.room} as ${conn.metadata.username}`
        console.log(successMessage, conn)
        this.notyf.success(successMessage)
      } catch (err) {
        // Do unique error handling if connection is passed along
        if (err.connection) {
          err.connection.close() // close connection politely
          // unregister peer politely
          //TODO: check that this behaivor is desirable
          this.peer.destroy()
          this.peer = true // invalidate this page and force refresh
        }
        let errorMessage = err.connection
          ? err.message.toString()
          : err.toString()
        console.error(errorMessage)
        this.notyf.error(errorMessage)
        return
      }
    },
    /**
     * send message to room if connected
     */
    sendMessage () {
      if (!this.peer) {
        this.notyf.error('you are not registered')
        return
      }

      if (this.connections.length == 0) {
        this.notyf.error('no peers to send too')
        return
      }

      if (!this.message) {
        this.notyf.error('please type a message')
        return
      }

      // Send to connections
      broadcast(this.connections, this.username, this.message)
      // Add local message
      this.messages.push({
        from: this.username,
        data: this.message
      })

      this.scrollMessages()
      this.message = ''
    }
  }
}
