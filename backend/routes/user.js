const router = require('express').Router();
const pool = require('../db');

// 1. PUBLIC ROUTE: Get all parking lots
router.get('/lots', async (req, res) => {
  try {
    const allLots = await pool.query("SELECT * FROM lots");
    res.json(allLots.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. NEW ROUTE: Get active bookings for a specific user
// This is what the frontend needs to show the blue "Active Booking" card
router.get('/my-bookings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const activeBookings = await pool.query(
      "SELECT * FROM reservations WHERE user_id = $1 AND is_ongoing = true",
      [userId]
    );
    res.json(activeBookings.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. USER ROUTE: Book a parking spot
router.post('/book', async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, lot_id, vehicle_num } = req.body;
    await client.query('BEGIN');

    const availableSpot = await client.query(
      "SELECT spot_id FROM spots WHERE lot_id = $1 AND status = 'a' LIMIT 1 FOR UPDATE",
      [lot_id]
    );

    if (availableSpot.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "No available spots in this lot!" });
    }

    const spotId = availableSpot.rows[0].spot_id;
    await client.query("UPDATE spots SET status = 'o' WHERE spot_id = $1", [spotId]);

    const lotInfo = await client.query("SELECT price_per_hr FROM lots WHERE lot_id = $1", [lot_id]);
    const pricePerHr = lotInfo.rows[0].price_per_hr;

    const newReservation = await client.query(
      "INSERT INTO reservations (lot_id, spot_id, user_id, vehicle_num, price_per_hr) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [lot_id, spotId, user_id, vehicle_num, pricePerHr]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: "Booking Successful!", booking: newReservation.rows[0] });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
});

// 4. USER ROUTE: Checkout
router.put('/checkout/:reserve_id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { reserve_id } = req.params;
    await client.query('BEGIN');

    const reserveData = await client.query(
      "SELECT spot_id, start_time, price_per_hr FROM reservations WHERE reserve_id = $1 AND is_ongoing = true",
      [reserve_id]
    );

    if (reserveData.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Active reservation not found" });
    }

    const { spot_id, start_time, price_per_hr } = reserveData.rows[0];
    const endTime = new Date();
    const startTime = new Date(start_time);
    const durationInHours = Math.max(1, Math.ceil((endTime - startTime) / (1000 * 60 * 60))); 
    const totalAmount = durationInHours * price_per_hr;

    await client.query("UPDATE spots SET status = 'a' WHERE spot_id = $1", [spot_id]);
    await client.query(
      "UPDATE reservations SET end_time = $1, is_ongoing = false WHERE reserve_id = $2",
      [endTime, reserve_id]
    );

    const payment = await client.query(
      "INSERT INTO payments (reserve_id, total_amt, payment_method) VALUES ($1, $2, $3) RETURNING *",
      [reserve_id, totalAmount, 'Cash/Card']
    );

    await client.query('COMMIT');
    res.json({
      message: "Checkout successful!",
      hours_stayed: durationInHours,
      total_bill: `₹${totalAmount}`,
      payment_details: payment.rows[0]
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
});

// 5. Get all spots for a specific lot
router.get('/lots/:lotId/spots', async (req, res) => {
  try {
    const { lotId } = req.params;
    const spots = await pool.query(
      "SELECT * FROM spots WHERE lot_id = $1 ORDER BY spot_id ASC", 
      [lotId]
    );
    res.json(spots.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;