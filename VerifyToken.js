const jwt = require('jsonwebtoken')
const connection = require('./Database/connect')
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
// Middleware to verify token and check user type
const verifyAccess = allowedUserTypes => async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (authHeader) {
    const token = authHeader.split(' ')[1] // Assuming "Bearer TOKEN_STRING"

    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
      if (err) {
        console.log(err)
        return res.status(403).json({ message: 'Token is not valid' })
      }

      // Assuming `decoded` contains a userId. Adjust according to your token structure
      try {
        const db = await connection()

        const [user] = await query(
          'SELECT usertype.code FROM user JOIN usertype ON user.usertype_id = usertype.usertype_id WHERE user.user_id = ?',
          [decoded.user_id]
        )
        db.end()

        if (user && allowedUserTypes.includes(user.code)) {
          next() // User type is allowed, proceed to the next middleware or route handler
        } else {
          res.status(403).json({ message: 'Insufficient permissions' })
        }
      } catch (dbError) {
        console.error('Database error:', dbError)
        res.status(500).json({ message: 'Internal server error' })
      }
    })
  } else {
    res.status(401).json({ message: 'Authentication token is required' })
  }
}
module.exports = { verifyAccess }
