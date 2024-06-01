const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY)
const connection = require('../Database/connect')
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

const initiatePayment = async (req, res) => {
  try {
    const { amount, currency, order_id } = req.body

    if (!amount || !currency) {
      return res
        .status(400)
        .send({ error: 'Amount and currency are required.' })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in paisa if currency is PKR
      currency: currency
    })

    console.log(paymentIntent)
    // res.send({
    //   clientSecret: paymentIntent.client_secret
    // })
    if (paymentIntent.client_secret) {
      // If client_secret is present, then proceed to update the order
      const result = await query(
        'UPDATE `order` SET paid = 1 WHERE order_id = ?',
        [order_id]
      )
      // Send response after updating the database
      res.send({
        clientSecret: paymentIntent.client_secret,
        message: 'Payment initiated and order updated successfully'
      })
    } else {
      throw new Error(
        'PaymentIntent creation failed or client_secret not received'
      )
    }
  } catch (error) {
    res.status(500).send({
      error: error.message
    })
  }
}

module.exports = {
  initiatePayment
}
