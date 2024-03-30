const express = require("express");
const {
  addBillboard,
  getAllBillboards,
  updateBillboard,
  deleteBillboard,
} = require("../Controller/BillboardController"); // Adjust this path to where your BillboardController is located

const Route = express.Router();

// Define the route for adding a new billboard
Route.route("/billboards").post(addBillboard);

// Define the route for getting all billboards
Route.route("/billboards").get(getAllBillboards);

// Define the route for updating an existing billboard
// Assuming the billboard ID will be included in the body of the update request
// If you prefer to use a route parameter for the ID (e.g., /billboards/:id), you need to adjust accordingly
Route.route("/billboards").put(updateBillboard);

// Define the route for deleting a billboard
// Here we use a route parameter for the billboard ID
Route.route("/billboards/:id").delete(deleteBillboard);

module.exports = Route;
