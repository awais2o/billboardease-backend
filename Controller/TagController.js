const connection = require('../Database/connect')
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
exports.getTags = async (req, res) => {
  try {
    const result = await query('SELECT * FROM tag', [])
    res.status(200).json({
      message: 'Tags retrieved successfully',
      tags: result
    })
  } catch (err) {
    console.error('Error retrieving Tags:', err)
    res
      .status(500)
      .json({ message: 'Error retrieving Tags', error: err.message })
  }
}
