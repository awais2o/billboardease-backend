// Require necessary modules
require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const saltRounds = 10 // This is the cost factor for hashing the password.
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

// Function to retrieve all users with usertype 'user'
const getUsersByType = async (req, res) => {
  // List the columns explicitly, omitting the password column
  const sql = `
    SELECT u.user_id, u.name, u.email, u.cnic, u.phone_number, u.created_at, u.status, u.usertype_id
    FROM user u
    INNER JOIN usertype ut ON u.usertype_id = ut.usertype_id
    WHERE ut.name = 'USER';
  `
  try {
    const results = await query(sql)
    console.log('Users fetched successfully:', results)
    res.status(200).json({
      message: 'Users retrieved successfully',
      users: results
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({
      message: 'Failed to retrieve users',
      error: error
    })
  }
}
const banUser = async (req, res) => {
  const { userId } = req.params // Assuming the user ID is passed as a URL parameter

  // SQL query to update the user's status
  const sql = 'UPDATE user SET status = 0 WHERE user_id = ?'

  try {
    const results = await query(sql, [userId])
    if (results.affectedRows === 0) {
      // No rows updated, probably because the user does not exist
      res.status(404).json({ message: 'User not found or already banned.' })
      return
    }
    res.status(200).json({ message: 'User banned successfully.' })
  } catch (error) {
    console.error('Error banning user:', error)
    res.status(500).json({ message: 'Failed to ban user.', error })
  }
}
const unbanUser = async (req, res) => {
  const { userId } = req.params // Assuming the user ID is passed as a URL parameter

  // SQL query to update the user's status
  const sql = 'UPDATE user SET status = 1 WHERE user_id = ?'

  try {
    const results = await query(sql, [userId])
    if (results.affectedRows === 0) {
      // No rows updated, probably because the user does not exist
      res.status(404).json({ message: 'User not found or already unbanned.' })
      return
    }
    res.status(200).json({ message: 'User unbanned successfully.' })
  } catch (error) {
    console.error('Error banning user:', error)
    res.status(500).json({ message: 'Failed to unban user.', error })
  }
}

module.exports = {
  getUsersByType,
  banUser,
  unbanUser
}
