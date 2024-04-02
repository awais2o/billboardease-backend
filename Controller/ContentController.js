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
exports.addContent = async (req, res) => {
  const { title, filepath, description, user_id, contenttype_id } = req.body
  console.log('Inserting content:', {
    title,
    filepath,
    description,
    user_id,
    contenttype_id
  }) // Log input data

  try {
    const insertResult = await runQuery(
      'INSERT INTO content (title, filepath, description, user_id, contenttype_id) VALUES (?, ?, ?, ?, ?)',
      [title, filepath, description, user_id, contenttype_id]
    )
    console.log('Insert result:', insertResult) // Log insert result

    const [newContent] = await runQuery(
      'SELECT * FROM content WHERE content_id = ?', // Ensure 'content_id' matches your primary key column name
      [insertResult.insertId]
    )
    console.log('Fetched new content:', newContent) // Log fetched content

    if (!newContent) {
      return res
        .status(500)
        .json({ message: 'Failed to retrieve newly added content' })
    }

    res.status(201).json({
      message: 'Content added successfully',
      content: newContent
    })
  } catch (error) {
    console.error('Error adding content:', error)
    res
      .status(500)
      .json({ message: 'Failed to add content', error: error.message })
  }
}

exports.getAllContents = async (req, res) => {
  try {
    const contents = await runQuery('SELECT * FROM content', [])
    res.status(200).json(contents)
  } catch (error) {
    console.error('Error retrieving contents:', error)
    res.status(500).json({ message: 'Failed to retrieve contents' })
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
  const { title, filepath, description, user_id, contenttype_id } = req.body
  try {
    // Perform the update
    const updateResult = await runQuery(
      'UPDATE content SET title = ?, filepath = ?, description = ?, user_id = ?, contenttype_id = ? WHERE content_id = ?',
      [title, filepath, description, user_id, contenttype_id, id]
    )

    // Check if the content was successfully updated
    if (updateResult.affectedRows > 0) {
      // Fetch the updated content
      const updatedContent = await runQuery(
        'SELECT * FROM content WHERE content_id = ?',
        [id]
      )

      // Ensure we found the updated content
      if (updatedContent.length > 0) {
        res.status(200).json({
          message: 'Content updated successfully',
          content: updatedContent[0]
        })
      } else {
        res.status(404).json({ message: 'Updated content not found' })
      }
    } else {
      res.status(404).json({ message: 'Content not found' })
    }
  } catch (error) {
    console.error('Error updating content:', error)
    res
      .status(500)
      .json({ message: 'Failed to update content', error: error.message })
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
