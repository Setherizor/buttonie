function data () {
  return {
    // Dynamic Data
    messages: [],
    alerts: [],
    // Form Data
    roomcode: 'YEET', // for now room codes are just other's usernames
    username: '',
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
    created () {},
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
     * As peer, just write to page
     * As host, repeat to all but sending peer
     */
    messageHandler (message) {
      if (this.isHost) broadcast(this.connections, message.from, message.data)

      // Scroll down
      this.scrollMessages()
      this.messages.push(message)
    },
    /**
     * Setup listeners for connections
     * HOST & CLIENT
     */
    connectionHandler (conn) {
      // data is launched when you receive a message
      conn.on('data', data => this.messageHandler(data))

      // generic status update handler
      const statusUpdate = status =>
        broadcast(
          this.connections,
          this.isHost ? 'server' : this.username,
          conn.metadata.username + ' ' + status
        )

      // open is launched when you successfully connect to PeerServer
      conn.on('open', () => {
        console.log('Connection opened:', conn.label)
        statusUpdate('has joined to ' + conn.metadata.room)
      })

      // detect when a connection is closed (won't work in Firefox)
      conn.on('close', () => {
        console.log('Connection closed:', conn.label)
        statusUpdate('has left to ' + conn.peer)
      })

      // catch all
      conn.on('error', e => console.log('Connection error:', e))

      // Add to host's connections
      this.connections.push(conn)
      console.log('added connection', this.connections)
    },
    /**
     * Join broker server with a given ID
     */
    broker (peerID) {
      if (!this.peer)
        this.peer = new Peer(peerID, {
          host: 'pi.sethp.cc',
          port: 9001,
          path: '/buttonie'
        })

      return new Promise((resolve, reject) => {
        this.peer.on('open', id => console.log('brokered:', id, this.peer))
        resolve()
      })
    },
    /**
     * Host a gameroom
     */
    async host () {
      let id = this.username
      let room = this.roomcode
      this.broker(room)

      // Setup incoming connection handler
      this.peer.on('connection', conn => this.connectionHandler(conn))

      this.isHost = true
      // this.ingame = true
    },
    /**
     * Join the gameroom
     */
    async join () {
      // Join the connection broker (PeerServer)
      let id = this.username
      let room = this.roomcode

      // Close current connections
      if (this.peer) this.peer.destroy()
      if (this.connections.length != 0) this.connection = []

      await this.broker(id + '-peer')

      let conn = this.peer.connect(this.roomcode, {
        label: id + '-connection',
        metadata: {
          username: id,
          room
        }
      })

      this.connectionHandler(conn)
      // this.ingame = true
      console.log('You have entered the game')
    },
    /**
     * send message to room if connected
     */
    sendMessage () {
      if (!this.peer) {
        alert('You have not connected to the broker')
        return
      }

      if (this.connections.length == 0) {
        alert('There is no one to send the message to')
        return
      }

      if (!this.message) {
        alert('Please type a message to send')
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
