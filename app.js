require('dotenv').config()

const express = require('express')
const http = require('http')
const connection = require('./Database/connect')
const parser = require('body-parser')
const cors = require('cors')
const authRoute = require('./Route/AuthRoute')
const mediaRoute = require('./Route/MediaRoute')
const contentRoute = require('./Route/ContentRoute')
const billboardRoute = require('./Route/BillboardRoute')
const tagroute = require('./Route/TagRoute')
const AllUsersroute = require('./Route/AllUsers')
const wishlistRoute = require('./Route/WishlistRoute') // Adjust the path as necessary
const proceedingRoute = require('./Route/ProceedingRoute') // Adjust the path as necessary
const paymentRoute = require('./Route/PaymentRoute')
const biddingSocket = require('./Sockets/biddingSocket') // Import the new WebSocket file
const bidRoute = require('./Route/BidRoute')

const app = express()
const server = http.createServer(app)

const PORT = process.env.PORT
const corsOptions = {
  origin: '*', // Allow only your front-end origin
  // origin: 'http://192.168.100.136:3000', // Allow only your front-end origin

  credentials: true, // Allow cookies and sessions
  optionsSuccessStatus: 200 // Legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))
app.use('/media', express.static('media'))
app.use(parser.json())
app.use('/auth', authRoute)
app.use('/media', mediaRoute)
app.use('/billboard', billboardRoute)
app.use('/content', contentRoute)
app.use('/tags', tagroute)
app.use('/allusers', AllUsersroute)
app.use('/wishlist', wishlistRoute)
app.use('/proceed', proceedingRoute)
app.use('/payment', paymentRoute) // Use the new payment route
app.use('/bid', bidRoute)

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' })
})

// Use the biddingSocket function to handle WebSocket connections
biddingSocket(server)

const start = async () => {
  const connect = await connection()
  connect.end()

  server.listen(PORT, () => {
    console.log('Server is running')
  })
}

start()
