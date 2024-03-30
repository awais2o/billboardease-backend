const connect = require("../Database/connect");

// Add a new billboard
const addBillboard = async (req, res) => {
  const db = await connect();
  const {
    location_address,
    longitude,
    latitude,
    dimension_x,
    dimension_y,
    tag,
  } = req.body;
  try {
    // First, insert the new billboard
    const insertResult = await db.query(
      "INSERT INTO billboard (location_address, longitude, latitude, dimension_x, dimension_y, tag) VALUES (?, ?, ?, ?, ?, ?)",
      [location_address, longitude, latitude, dimension_x, dimension_y, tag]
    );

    // Then, fetch the newly created billboard using the insertId
    const newBillboardId = insertResult.insertId;
    const [newBillboard] = await db.query(
      "SELECT * FROM billboard WHERE id = ?",
      [newBillboardId]
    );

    // Finally, send the new billboard object in the response
    res.status(201).json({
      message: "Billboard added successfully",
      billboard: newBillboard,
    });
  } catch (err) {
    res.status(500).send("Error adding billboard");
    console.error(err);
  }
};

// Get all billboards
const getAllBillboards = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM billboard");
    res.status(200).json(result);
  } catch (err) {
    res.status(500).send("Error retrieving billboards");
    console.error(err);
  }
};

// Update a billboard
const updateBillboard = async (req, res) => {
  const {
    id,
    location_address,
    longitude,
    latitude,
    dimension_x,
    dimension_y,
    tag,
  } = req.body;
  try {
    const result = await db.query(
      "UPDATE billboard SET location_address = ?, longitude = ?, latitude = ?, dimension_x = ?, dimension_y = ?, tag = ? WHERE id = ?",
      [location_address, longitude, latitude, dimension_x, dimension_y, tag, id]
    );
    if (result.affectedRows > 0) {
      res.send("Billboard updated successfully.");
    } else {
      res.status(404).send("Billboard not found.");
    }
  } catch (err) {
    res.status(500).send("Error updating billboard");
    console.error(err);
  }
};

// Delete a billboard
const deleteBillboard = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM billboard WHERE id = ?", [id]);
    if (result.affectedRows > 0) {
      res.send("Billboard deleted successfully.");
    } else {
      res.status(404).send("Billboard not found.");
    }
  } catch (err) {
    res.status(500).send("Error deleting billboard");
    console.error(err);
  }
};

module.exports = {
  addBillboard,
  getAllBillboards,
  updateBillboard,
  deleteBillboard,
};
