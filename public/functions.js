/**
 * Send message to all connections
 * Excluding the connection to the peer who originated the message
 */
function broadcast (connections, username, message) {
  // Send message in predictable format
  let payload = {
    from: username,
    data: message
  }

  // Filter uses naming scheme `username-peer`
  connections
    .filter(c => c.peer.split('-')[0] != username)
    .forEach(c => c.send(payload))

  return payload
}
