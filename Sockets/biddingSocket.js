const socketIo = require('socket.io')

const biddingSocket = server => {
  const io = socketIo(server, {
    cors: {
      origin: 'http://localhost:3000', // Client's URL
      methods: ['GET', 'POST'], // Allowed HTTP methods
      credentials: true // Allows cookies and sessions
    }
  })

  io.on('connection', socket => {
    console.log('A user connected')

    // Handle bid events
    socket.on('bid', bid => {
      // Broadcast the bid to all connected clients
      io.emit('bid', bid)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
  })
}

module.exports = biddingSocket
