const connection = require('../Database/connect')
const jwt = require('jsonwebtoken')

// Helper function to execute SQL queries with promise support
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

// Helper function to extract user_id from token
const getUserIdFromToken = authorizationHeader => {
  if (!authorizationHeader) {
    throw new Error('No authorization token provided')
  }
  const token = authorizationHeader.split(' ')[1] // Assumes 'Bearer <token>'
  const decoded = jwt.verify(token, process.env.SECRET_KEY)
  return decoded.user_id
}

// Controller function to get winning bids of the user
exports.getMyWinnings = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req.headers.authorization)
    const now = new Date()
    const twoDaysAhead = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) // Adds two days

    // Adjust minutes to either :00 or :30
    const minutes = twoDaysAhead.getMinutes()
    if (minutes < 30) {
      twoDaysAhead.setMinutes(0)
    } else {
      twoDaysAhead.setMinutes(30)
    }
    twoDaysAhead.setSeconds(0)
    twoDaysAhead.setMilliseconds(0)

    // Updated SQL query with JOIN to fetch title from billboard table
    const queryText = `
        SELECT b.bid_id, b.user_id, b.billboard_id, b.bidAmount, b.bidTime, b.forDateTime, b.isWinning, bb.title AS billboard_title
        FROM bid b
        INNER JOIN billboard bb ON b.billboard_id = bb.billboard_id
        WHERE b.user_id = ? AND b.isWinning = 1 AND b.forDateTime <= ? AND b.finalize = 0
      `

    const results = await query(queryText, [userId, twoDaysAhead])
    res.status(200).json({
      message: 'Winning bids retrieved successfully',
      winnings: results
    })
  } catch (err) {
    console.error('Error retrieving winning bids:', err)
    res.status(500).json({
      message: 'Error retrieving winning bids',
      error: err.message
    })
  }
}
// Controller function to attach content to a bid
exports.attachContentToBid = async (req, res) => {
  const { bid_id, content_id } = req.body // Extracting bid_id and content_id from request body

  if (!bid_id || !content_id) {
    return res.status(400).json({
      message: 'Missing bid_id or content_id in request'
    })
  }

  const db = connection() // Get database connection
  try {
    await db.beginTransaction() // Start transaction

    // Insert bid_id and content_id into the order table
    const insertOrderQuery = `
        INSERT INTO \`order\` (content_id, bid_id)
        VALUES (?, ?);
      `
    await query(insertOrderQuery, [content_id, bid_id])

    // Update finalize column in the bid table
    const updateBidQuery = `
        UPDATE bid
        SET finalize = 1
        WHERE bid_id = ?;
      `
    await query(updateBidQuery, [bid_id])

    await db.commit() // Commit the transaction
    res.status(200).json({
      message: 'Content successfully attached to bid and bid finalized'
    })
  } catch (err) {
    await db.rollback() // Rollback the transaction in case of error
    console.error('Error attaching content to bid:', err)
    res.status(500).json({
      message: 'Error attaching content to bid',
      error: err.message
    })
  } finally {
    db.end() // Close the database connection
  }
}
exports.getUpcomingOrderDetails = async (req, res) => {
  try {
    const queryText = `
        SELECT 
          o.order_id,
          o.approve,
          c.filepath AS contentFilepath,
          u.name AS userName,
          u.phone_number AS userPhoneNumber,
          b.bidAmount,
          b.forDateTime,
          bb.title AS billboardTitle
        FROM 
          \`order\` o
          INNER JOIN bid b ON o.bid_id = b.bid_id
          INNER JOIN content c ON o.content_id = c.content_id
          INNER JOIN user u ON c.user_id = u.user_id
          INNER JOIN billboard bb ON b.billboard_id = bb.billboard_id
        WHERE 
          b.forDateTime > NOW()
      `

    const results = await query(queryText)
    if (results.length > 0) {
      res.status(200).json({
        message: 'Upcoming order details retrieved successfully',
        orders: results
      })
    } else {
      res.status(404).json({
        message: 'No upcoming orders found'
      })
    }
  } catch (err) {
    console.error('Error retrieving upcoming order details:', err)
    res.status(500).json({
      message: 'Error retrieving upcoming order details',
      error: err.message
    })
  }
}
exports.approveContent = async (req, res) => {
  const { order_id } = req.body // Extracting order_id from the request body

  if (!order_id) {
    return res.status(400).json({
      message: 'order_id is required'
    })
  }

  try {
    const updateQuery = `
        UPDATE \`order\` 
        SET approve = 1
        WHERE order_id = ?;
      `

    const result = await query(updateQuery, [order_id])
    if (result.affectedRows > 0) {
      res.status(200).json({
        message: 'Content successfully approved',
        order_id: order_id
      })
    } else {
      res.status(404).json({
        message: 'Order not found'
      })
    }
  } catch (err) {
    console.error('Error approving content:', err)
    res.status(500).json({
      message: 'Error approving content',
      error: err.message
    })
  }
}
exports.unApproveContent = async (req, res) => {
  const { order_id } = req.body // Extracting order_id from the request body

  if (!order_id) {
    return res.status(400).json({
      message: 'order_id is required'
    })
  }

  try {
    const updateQuery = `
          UPDATE \`order\` 
          SET approve = 2
          WHERE order_id = ?;
        `

    const result = await query(updateQuery, [order_id])
    if (result.affectedRows > 0) {
      res.status(200).json({
        message: 'Content successfully disapproved',
        order_id: order_id
      })
    } else {
      res.status(404).json({
        message: 'Order not found'
      })
    }
  } catch (err) {
    console.error('Error approving content:', err)
    res.status(500).json({
      message: 'Error approving content',
      error: err.message
    })
  }
}
