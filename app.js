const express = require('express')
const connection = require('./Database/connect')
const parser = require('body-parser')
const cors = require('cors')
const authRoute = require('./Route/AuthRoute')
const App = express()
const PORT = process.env.PORT || 5000
App.use(cors())
App.get('/', (req, res) => {
  res.json({ message: 'Server is running' })
})
App.use(parser.json())
App.use('/auth', authRoute)
const start = async () => {
  const connect = await connection()
  connect.end()

  App.listen(PORT, () => {
    console.log('listening')
  })
  try {
  } catch (error) {}
}
start()
