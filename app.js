require('dotenv').config()

const express = require('express')
const connection = require('./Database/connect')
const parser = require('body-parser')
const cors = require('cors')
const authRoute = require('./Route/AuthRoute')
const mediaRoute = require('./Route/MediaRoute')
const contentRoute = require('./Route/ContentRoute')
const billboardRoute = require('./Route/BillboardRoute')
const tagroute = require('./Route/TagRoute')
const AllUsersroute = require('./Route/AllUsers')

const App = express()
const PORT = process.env.PORT
App.use(cors())
App.get('/', (req, res) => {
  res.json({ message: 'Server is running' })
})
App.use(parser.json())
App.use('/auth', authRoute)
App.use('/media', mediaRoute)
App.use('/billboard', billboardRoute)
App.use('/content', contentRoute)
App.use('/tags', tagroute)
App.use('/allusers', AllUsersroute)

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
