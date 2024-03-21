require('dotenv').config()

const connection = require('../Database/connect')
const jwt = require('jsonwebtoken')

const register = async (req, res) => {
  let tokenPayload = {}
  let reponseBody = {}
  const { cnic, password } = req.body

  const connect = await connection()
  let Query = 'INSERT INTO user (cnic,password) VALUES (?,?)'
  connect.query(Query, [cnic, password], async (err, result) => {
    if (err) {
      // Check if the error is a duplicate entry error
      if (err.code === 'ER_DUP_ENTRY') {
        // Handle duplicate entry error (cnic already exists)
        return res.status(400).json({ error: 'CNIC already exists' })
      } else {
        // Handle other internal server errors
        console.error('Error inserting user:', err)
        return res.status(500).json({ error: 'Internal server error' })
      }
    }
    console.log(result)
    tokenPayload = {
      user_id: result.insertId
    }
    connect.query(
      'select * from user where user_id=?',
      [result.insertId],
      async (err, rows) => {
        if (err) {
          return res.status(500).json({ error: 'Internal server error' })
        } else {
          const user = rows[0]
          console.log(user)
          reponseBody = {
            user_id: user.user_id,
            name: user.name,
            cnic: user.cnic,
            email: user.email,
            phone_number: user.phone_number
          }
          let token = jwt.sign(tokenPayload, process.env.SECRET_KEY)
          res.header('Authorization', `Bearer ${token}`)
          connect.end()
          return res.status(200).json(reponseBody)
        }
      }
    )
  })
}
module.exports = { register }
