/**
 * Send message to all connections on a given peer
 * Excluding the connection to the peer who originated the message
 */
function broadcast (peer, type, username, message) {
  // Send message in predictable format
  let payload = {
    type,
    from: username,
    data: message,
    timestamp: Date.now()
  }

  // Filter uses naming scheme `username-peer`
  Object.values(peer.connections)
    .flat()
    .filter(c => c.peer.split('-')[0] != username)
    .forEach(c => c.send(payload))

  return payload
}
