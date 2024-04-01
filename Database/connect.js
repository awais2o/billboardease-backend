const mysql = require('mysql')
const connectTo = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'billboardease'
}

// Adjusting the connection function not to be async since it returns a synchronous connection object
const connection = () => {
  return mysql.createConnection(connectTo)
}

module.exports = connection
