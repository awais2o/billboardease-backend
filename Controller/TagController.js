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
exports.createTag = async (req, res) => {
  const { tag_name } = req.body

  if (!tag_name) {
    return res.status(400).json({ message: 'Tag name is required' })
  }

  try {
    const result = await query('INSERT INTO tag (tag_name) VALUES (?)', [
      tag_name
    ])
    res.status(201).json({
      message: 'Tag created successfully',
      tagId: result.insertId
    })
  } catch (err) {
    console.error('Error creating Tag:', err)
    res.status(500).json({ message: 'Error creating Tag', error: err.message })
  }
}

exports.deleteTag = async (req, res) => {
  const { tag_id } = req.params

  if (!tag_id) {
    return res.status(400).json({ message: 'Tag ID is required' })
  }

  try {
    await query('DELETE FROM tag WHERE tag_id = ?', [tag_id])
    res.status(200).json({ message: 'Tag deleted successfully' })
  } catch (err) {
    console.error('Error deleting Tag:', err)
    res.status(500).json({ message: 'Error deleting Tag', error: err.message })
  }
}
