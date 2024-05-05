const jwt = require('jsonwebtoken')
const connection = require('../Database/connect')

const runQuery = (sql, params) => {
  return new Promise((resolve, reject) => {
    const db = connection()
    db.query(sql, params, (error, results) => {
      if (error) {
        db.end()
        reject(error)
        return
      }
      db.end()
      resolve(results)
    })
  })
}

const getUserIdFromToken = authorizationHeader => {
  if (!authorizationHeader) {
    throw new Error('No authorization token provided')
  }
  const token = authorizationHeader.split(' ')[1]
  const decoded = jwt.verify(token, process.env.SECRET_KEY)
  return decoded.user_id
}

exports.addToWishlist = async (req, res) => {
  const user_id = getUserIdFromToken(req.headers.authorization)
  const billboard_id = req.params.id
  const { date } = req.query // assuming date is passed as a query param

  try {
    const results = await runQuery(
      'INSERT INTO wishlist (user_id, billboard_id, forDate) VALUES (?, ?, ?)',
      [user_id, billboard_id, date]
    )
    res
      .status(201)
      .json({
        message: 'Added to wishlist successfully',
        wishlistId: results.insertId
      })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    res.status(500).json({ error: error.message })
  }
}

exports.getWishlist = async (req, res) => {
  const user_id = getUserIdFromToken(req.headers.authorization)
  try {
    const results = await runQuery('SELECT * FROM wishlist WHERE user_id = ?', [
      user_id
    ])
    res.status(200).json(results)
  } catch (error) {
    console.error('Error retrieving wishlist:', error)
    res.status(500).json({ error: error.message })
  }
}

// Add more functions as necessary
