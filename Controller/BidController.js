const connection = require('../Database/connect')

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

// Get the current highest bid for a specified billboard and dateTime
exports.getCurrentBid = async (req, res) => {
  const { billboard_id, dateTime } = req.query
  try {
    const result = await query(
      'SELECT bidAmount AS bid, forDateTime AS dateTime, billboard_id, user_id FROM bid WHERE billboard_id = ? AND forDateTime = ? AND isWinning = true ORDER BY bidAmount DESC LIMIT 1',
      [billboard_id, dateTime]
    )
    if (result.length > 0) {
      res.status(200).json(result[0])
    } else {
      res.status(200).json({ message: 'No bids found' })
    }
  } catch (error) {
    console.error('Error fetching current bid:', error)
    res
      .status(500)
      .json({ message: 'Failed to fetch current bid, please try again' })
  }
}

// Place a new bid
exports.placeBid = async (req, res) => {
  const { bid, dateTime, billboard_id, user_id } = req.body
  const roomName = `${billboard_id}_${dateTime}`
  const db = connection() // Get database connection

  try {
    db.beginTransaction() // Start transaction

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

    db.commit() // Commit the transaction

    const bidData = {
      bid,
      dateTime: dateTime,
      billboard_id,
      user_id,
      isWinning: true
    }
    currentBids[roomName] = bidData // Store the latest bid

    res.status(200).json(bidData)
  } catch (error) {
    await db.rollback() // Rollback the transaction in case of error
    console.error('Error handling bid:', error)
    res.status(500).json({ message: 'Failed to place bid, please try again' })
  } finally {
    db.end() // End the connection
  }
}

// Utility function to add days to a date
const addDays = (date, days) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Get the list of available dates within 30 days
const getAvailableDates = async billboard_id => {
  const today = new Date()
  const thirtyDaysLater = addDays(today, 30)
  const availableDates = []

  for (let i = 0; i < 30; i++) {
    const currentDate = addDays(today, i).toISOString().split('T')[0]
    const result = await query(
      'SELECT 1 FROM bid WHERE billboard_id = ? AND toDate IS NOT NULL AND forDateTime <= ? AND toDate >= ?',
      [billboard_id, currentDate, currentDate]
    )
    if (result.length === 0) {
      availableDates.push(currentDate)
    }
  }

  return availableDates
}

// Place an order
exports.order = async (req, res) => {
  const { user_id, billboard_id, bid, forDateTime, toDate } = req.body
  const roomName = `${billboard_id}_${forDateTime}`

  try {
    // Check for overlapping bids
    const overlappingBids = await query(
      'SELECT 1 FROM bid WHERE billboard_id = ? AND toDate IS NOT NULL AND forDateTime <= ? AND toDate >= ?',
      [billboard_id, toDate, forDateTime]
    )

    if (overlappingBids.length > 0) {
      const availableDates = await getAvailableDates(billboard_id)
      res.status(409).json({ message: 'Date clash found', availableDates })

      return
    }

    // Insert the new bid
    await query(
      'INSERT INTO bid (user_id, billboard_id, bidAmount, bidTime, forDateTime, toDate, isWinning) VALUES (?, ?, ?, NOW(), ?, ?, true)',
      [user_id, billboard_id, bid, forDateTime, toDate]
    )

    const bidData = {
      bid,
      forDateTime,
      toDate,
      billboard_id,
      user_id,
      isWinning: true
    }
    currentBids[roomName] = bidData // Store the latest bid

    res.status(200).json(bidData)
  } catch (error) {
    console.error('Error handling order:', error)
    res.status(500).json({ message: 'Failed to place order, please try again' })
  }
}
