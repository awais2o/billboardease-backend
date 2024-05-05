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

// Add a new billboard
exports.addBillboard = async (req, res) => {
  const {
    title,
    location_address,
    longitude,
    latitude,
    dimension_x,
    dimension_y,
    image,
    tag_id,
    baseprice,
    quantity
  } = req.body
  try {
    const insertResult = await query(
      'INSERT INTO billboard (title, location_address, longitude, latitude, dimension_x, dimension_y, image, tag_id, baseprice, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        title,
        location_address,
        longitude,
        latitude,
        dimension_x,
        dimension_y,
        image,
        tag_id,
        baseprice,
        quantity
      ]
    )

    // Fetching the newly added billboard to return it
    const newBillboard = await query(
      'SELECT * FROM billboard WHERE billboard_id = ?',
      [insertResult.insertId]
    )

    res.status(201).json({
      message: 'Billboard added successfully',
      billboard: newBillboard.length > 0 ? newBillboard[0] : null
    })
  } catch (err) {
    console.error('Error adding billboard:', err)
    res
      .status(500)
      .json({ message: 'Error adding billboard', error: err.message })
  }
}

exports.getAllBillboards = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM billboard ORDER BY billboard_id DESC',
      []
    )
    res.status(200).json({
      message: 'Billboards retrieved successfully',
      billboards: result
    })
  } catch (err) {
    console.error('Error retrieving billboards:', err)
    res
      .status(500)
      .json({ message: 'Error retrieving billboards', error: err.message })
  }
}

exports.getBillboardById = async (req, res) => {
  const id = req.params.id // Access the ID provided in the route

  try {
    const result = await query(
      'SELECT * FROM billboard WHERE billboard_id = ?',
      [id]
    )
    if (result.length > 0) {
      res.status(200).json({
        message: 'Billboard retrieved successfully',
        billboard: result[0]
      }) // Send the found billboard in JSON format
    } else {
      res.status(404).json({ message: 'Billboard not found' }) // Respond with JSON for consistency
    }
  } catch (err) {
    console.error('Error retrieving billboard:', err)
    res
      .status(500)
      .json({ message: 'Error retrieving billboard', error: err.message })
  }
}

exports.updateBillboard = async (req, res) => {
  const { id } = req.params
  const {
    title,
    location_address,
    longitude,
    latitude,
    dimension_x,
    dimension_y,
    image,
    tag_id: tag,
    baseprice,
    quantity
  } = req.body

  try {
    const updateResult = await query(
      'UPDATE billboard SET title = ?, location_address = ?, longitude = ?, latitude = ?, dimension_x = ?, dimension_y = ?, image = ?, tag_id = ?, baseprice = ?, quantity = ? WHERE billboard_id = ?',
      [
        title,
        location_address,
        longitude,
        latitude,
        dimension_x,
        dimension_y,
        image,
        tag,
        baseprice,
        quantity,
        id
      ]
    )

    // Check if the billboard was successfully updated
    if (updateResult.affectedRows > 0) {
      // Fetch the updated billboard
      const [updatedBillboards] = await query(
        'SELECT * FROM billboard WHERE billboard_id = ?',
        [id]
      )

      // Return the updated billboard data
      if (updatedBillboards) {
        res.status(200).json({
          message: 'Billboard updated successfully.',
          billboard: updatedBillboards
        })
      } else {
        res.status(404).json({ message: 'Updated billboard not found.' })
      }
    } else {
      res.status(404).json({ message: 'Billboard not found.' })
    }
  } catch (err) {
    console.error('Error updating billboard:', err)
    res
      .status(500)
      .json({ message: 'Error updating billboard', error: err.message })
  }
}

exports.deleteBillboard = async (req, res) => {
  const { id } = req.params // Extracting the ID from the URL path

  try {
    const deleteResult = await query(
      'DELETE FROM billboard WHERE billboard_id = ?',
      [id]
    )

    // Check if the billboard was successfully deleted
    if (deleteResult.affectedRows > 0) {
      res.json({
        message: 'Billboard deleted successfully',
        deletedBillboardId: id
      })
    } else {
      res.status(404).json({ message: 'Billboard not found' })
    }
  } catch (err) {
    console.error('Error deleting billboard:', err)
    res
      .status(500)
      .json({ message: 'Error deleting billboard', error: err.message })
  }
}
