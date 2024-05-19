const socketIo = require('socket.io')
const connection = require('../Database/connect')
const jwt = require('jsonwebtoken')

// Function to execute SQL queries with promise support
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    const db = connection() // Initialize the database connection
    db.query(sql, params, (error, results) => {
      if (error) {
        db.end() // Make sure to end the connection when an error occurs
        reject(error)
        return
      }
      db.end() // End the connection after the query has been executed
      resolve(results)
    })
  })
}

const currentBids = {} // Object to store the current highest bid for each billboard and dateTime

const biddingSocket = server => {
  const io = socketIo(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  io.on('connection', socket => {
    console.log('A user connected')

    socket.on('joinRoom', ({ billboard_id, dateTime }) => {
      const roomName = `${billboard_id}_${dateTime}` // Create a unique room identifier
      socket.join(roomName)
      console.log(
        `User joined room for billboard ${billboard_id} at ${dateTime}`
      )

      if (currentBids[roomName]) {
        socket.emit('bid', currentBids[roomName])
      }
    })

    socket.on('bid', async ({ bid, dateTime, billboard_id, user_id }) => {
      const roomName = `${billboard_id}_${dateTime}`
      try {
        // First, mark all existing bids for the same billboard and dateTime as not winning
        await query(
          'UPDATE bid SET isWinning = false WHERE billboard_id = ? AND forDateTime = ?',
          [billboard_id, dateTime]
        )

        // Then, insert the new bid and mark it as winning
        await query(
          'INSERT INTO bid (user_id, billboard_id, bidAmount, bidTime, forDateTime, isWinning) VALUES (?, ?, ?, NOW(), ?, true)',
          [user_id, billboard_id, bid, dateTime]
        )

        // Update the current highest bid for the billboard and dateTime
        const bidData = {
          bid,
          dateTime,
          billboard_id,
          user_id,
          isWinning: true
        }
        currentBids[roomName] = bidData // Store the latest bid

        // Broadcast the bid to all clients in the room, including the sender
        io.to(roomName).emit('bid', bidData)
        console.log(
          `Bid of ${bid} placed for datetime ${dateTime} on billboard ${billboard_id}`
        )
      } catch (error) {
        console.error('Error handling bid:', error)
      }
    })

    socket.on('leaveRoom', ({ billboard_id, dateTime }) => {
      const roomName = `${billboard_id}_${dateTime}`
      socket.leave(roomName)
      console.log(`User left room for billboard ${billboard_id} at ${dateTime}`)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
  })
}

module.exports = biddingSocket
