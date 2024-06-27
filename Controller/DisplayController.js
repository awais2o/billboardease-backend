// Get content by datetime and billboard_id
const connection = require('../Database/connect')

// Utility to run database queries
const runQuery = (sql, params) => {
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
exports.getContentByDateTimeAndBillboard = async (req, res) => {
  const { forDateTime, billboard_id } = req.query

  try {
    // Query to select the content filepath based on the matching order and bid
    const sql = `
    SELECT c.filepath 
FROM content c
JOIN \`order\` o ON c.content_id = o.content_id
JOIN bid b ON o.bid_id = b.bid_id
WHERE b.billboard_id = ? AND b.forDateTime = ?
AND b.isWinning = 1
AND o.approve = 1  
AND o.paid = 1;     
`

    const contents = await runQuery(sql, [billboard_id, forDateTime])
    console.log(contents, forDateTime, billboard_id)
    if (contents.length > 0) {
      res.status(200).json({ filepath: contents[0].filepath })
    } else {
      res
        .status(404)
        .json({ message: 'Content not found for the given parameters' })
    }
  } catch (error) {
    console.error('Error retrieving content by datetime and billboard:', error)
    res
      .status(500)
      .json({ message: 'Failed to retrieve content', error: error.message })
  }
}
