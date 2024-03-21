const mysql = require('mysql')

const connectTo = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'billboardease'
}
const connection = async () => {
  try {
    let connect = mysql.createConnection(connectTo)
    console.log('connected to Database')
    return connect
  } catch (error) {
    throw error
  }
}

module.exports = connection
