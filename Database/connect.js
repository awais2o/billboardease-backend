const mysql = require('mysql')
const connectTo = {
  // host: 'brqyaklabyurutynaewk-mysql.services.clever-cloud.com',
  // user: 'umrzqlj3mf9iajt0',
  // password: 'hZobZNY343MojJeUX6nS',
  // database: 'brqyaklabyurutynaewk'
  host:'127.0.0.1',
  user:'root',
  password:'',
  database:'billboardease'

}

// Adjusting the connection function not to be async since it returns a synchronous connection object
const connection = () => {
  return mysql.createConnection(connectTo)
}
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
module.exports = connection
