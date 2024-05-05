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
const jwt = require('jsonwebtoken')

// Function to extract user ID from JWT
const getUserIdFromToken = authorizationHeader => {
  if (!authorizationHeader) {
    throw new Error('No authorization token provided')
  }
  const token = authorizationHeader.split(' ')[1] // Assumes Bearer token
  const decoded = jwt.verify(token, process.env.SECRET_KEY) // Use your JWT secret
  return decoded.user_id
}

// Add new content
exports.addContent = async (req, res) => {
  try {
    const user_id = getUserIdFromToken(req.headers.authorization)
    const { title, filepath, description } = req.body
    const insertResult = await runQuery(
      'INSERT INTO content (title, filepath, description, user_id) VALUES (?, ?, ?, ?)',
      [title, filepath, description, user_id]
    )
    const newContent = await runQuery(
      'SELECT * FROM content WHERE content_id = ?',
      [insertResult.insertId]
    )
    res.status(201).json({
      message: 'Content added successfully',
      content: newContent.length > 0 ? newContent[0] : null
    })
  } catch (err) {
    console.error('Error adding content:', err)
    res
      .status(500)
      .json({ message: 'Error adding content', error: err.message })
  }
}

// Other functions follow a similar pattern

exports.getAllContents = async (req, res) => {
  try {
    const user_id = getUserIdFromToken(req.headers.authorization)
    // First, retrieve the user type for the given user_id
    const user = await runQuery(
      'SELECT usertype_id FROM user WHERE user_id = ?',
      [user_id]
    )

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const usertype_id = user[0].usertype_id
    let sql = 'SELECT * FROM content'

    // Conditionally adjust SQL based on user type
    if (usertype_id === 2) {
      sql += ' WHERE user_id = ?' // Restrict content to the specific user
    }

    const contents = await runQuery(sql, usertype_id === 2 ? [user_id] : [])
    res.status(200).json(contents)
  } catch (error) {
    console.error('Error retrieving contents:', error)
    if (error.name === 'JsonWebTokenError') {
      res
        .status(401)
        .json({ message: 'Invalid or expired token', error: error.message })
    } else {
      res
        .status(500)
        .json({ message: 'Failed to retrieve contents', error: error.message })
    }
  }
}
exports.getContentById = async (req, res) => {
  const { id } = req.params
  try {
    const content = await runQuery(
      'SELECT * FROM content WHERE content_id = ?',
      [id]
    )
    if (content.length > 0) {
      res.status(200).json(content[0])
    } else {
      res.status(404).json({ message: 'Content not found' })
    }
  } catch (error) {
    console.error('Error retrieving content:', error)
    res.status(500).json({ message: 'Failed to retrieve content' })
  }
}

exports.updateContent = async (req, res) => {
  const { id } = req.params
  const { title, filepath, description } = req.body

  try {
    const user_id = getUserIdFromToken(req.headers.authorization)

    const updateResult = await runQuery(
      'UPDATE content SET title = ?, filepath = ?, description = ?, user_id = ? WHERE content_id = ?',
      [title, filepath, description, user_id, id]
    )
    if (updateResult.affectedRows > 0) {
      const updatedContent = await runQuery(
        'SELECT * FROM content WHERE content_id = ?',
        [id]
      )
      res.status(200).json({
        message: 'Content updated successfully.',
        content: updatedContent.length > 0 ? updatedContent[0] : null
      })
    } else {
      res.status(404).json({ message: 'Content not found.' })
    }
  } catch (err) {
    console.error('Error updating content:', err)
    if (err.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Invalid token', error: err.message })
    } else {
      res
        .status(500)
        .json({ message: 'Error updating content', error: err.message })
    }
  }
}

exports.deleteContent = async (req, res) => {
  const { id } = req.params
  try {
    const result = await runQuery('DELETE FROM content WHERE content_id = ?', [
      id
    ])
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Content deleted successfully' })
    } else {
      res.status(404).json({ message: 'Content not found' })
    }
  } catch (error) {
    console.error('Error deleting content:', error)
    res.status(500).json({ message: 'Failed to delete content' })
  }
}
