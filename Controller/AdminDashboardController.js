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

const getTotalBillboards = async (req, res) => {
  try {
    const result = await runQuery('SELECT COUNT(*) AS total FROM billboard', [])
    res.json(result[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
const getRecentBillboards = async (req, res) => {
  try {
    const result = await runQuery(
      'SELECT COUNT(*) AS recentCount FROM billboard WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
      []
    )
    res.json(result[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getTotalUsers1 = async (req, res) => {
  try {
    const result = await runQuery(
      'SELECT COUNT(*) AS total FROM user WHERE usertype_id = 1',
      []
    )
    res.json(result[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
const getRecentAdvertisersCount = async (req, res) => {
  try {
    const result = await runQuery(
      'SELECT COUNT(*) AS recentCount FROM user WHERE usertype_id = 1 AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
      []
    )
    res.json(result[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getTotalUsers2 = async (req, res) => {
  try {
    const result = await runQuery(
      'SELECT COUNT(*) AS total FROM user WHERE usertype_id = 2',
      []
    )
    res.json(result[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
const getTotalRevenue = async (req, res) => {
  try {
    const result = await runQuery(
      'SELECT SUM(b.bidAmount) AS totalRevenue FROM `order` o JOIN bid b ON o.bid_id = b.bid_id WHERE o.paid = 1',
      []
    )
    res.json(result[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
const getAverageBid = async (req, res) => {
  try {
    const result = await runQuery(
      'SELECT AVG(bidAmount) AS averageBid FROM bid',
      []
    )
    res.json(result[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
const getMonthlyRevenueGrowth = async (req, res) => {
  try {
    // Query for current month's revenue
    const currentMonthRevenueResult = await runQuery(
      'SELECT SUM(b.bidAmount) AS revenue FROM `order` o JOIN bid b ON o.bid_id = b.bid_id WHERE o.paid = 1 AND o.created_at >= DATE_FORMAT(CURDATE() , "%Y-%m-01")',
      []
    )
    const currentMonthRevenue = currentMonthRevenueResult[0].revenue || 0

    // Query for previous month's revenue
    const previousMonthRevenueResult = await runQuery(
      'SELECT SUM(b.bidAmount) AS revenue FROM `order` o JOIN bid b ON o.bid_id = b.bid_id WHERE o.paid = 1 AND o.created_at >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, "%Y-%m-01") AND o.created_at < DATE_FORMAT(CURDATE() , "%Y-%m-01")',
      []
    )
    const previousMonthRevenue = previousMonthRevenueResult[0].revenue || 0

    // Calculate growth percentage
    let growth = 0
    if (previousMonthRevenue > 0) {
      growth =
        ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
        100
    } else if (currentMonthRevenue > 0) {
      growth = 100 // If there's no previous month's revenue but there's current revenue, growth is 100%
    }

    res.json({ growth })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
module.exports = {
  getTotalBillboards,
  getRecentBillboards,
  getTotalUsers1,
  getRecentAdvertisersCount,
  getTotalUsers2,
  getTotalRevenue,
  getAverageBid,
  getMonthlyRevenueGrowth
}
