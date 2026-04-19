const router = require('express').Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Middleware to verify Admin
const verifyAdmin = (req, res, next) => {
  const token = req.header("token");
  if (!token) return res.status(403).json({ error: "Access Denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    if (req.user.is_admin !== true) {
      return res.status(403).json({ error: "Admins Only" });
    }
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid Token" });
  }
};

// 1. GET all users for User Management
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await pool.query(
      "SELECT user_id, name, email FROM users ORDER BY user_id DESC"
    );
    res.json(users.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. Create Parking Lot & Generate Spots
router.post('/lots', verifyAdmin, async (req, res) => {
  try {
    const { prime_loc, address, pincode, price_per_hr, max_spots, is_shaded } = req.body;

    const newLot = await pool.query(
      "INSERT INTO lots (prime_loc, address, pincode, price_per_hr, max_spots, is_shaded) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [prime_loc, address, pincode, price_per_hr, max_spots, is_shaded]
    );

    const lotId = newLot.rows[0].lot_id;

    for (let i = 1; i <= max_spots; i++) {
      await pool.query("INSERT INTO spots (lot_id, status) VALUES ($1, $2)", [lotId, 'a']);
    }

    res.status(201).json({ message: "Lot and spots created!", lot: newLot.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. GET all active reservations across all lots (For Stats Cards)
router.get('/live-status', verifyAdmin, async (req, res) => {
  try {
    const live = await pool.query(`
      SELECT r.*, u.name as user_name, l.prime_loc 
      FROM reservations r
      JOIN users u ON r.user_id = u.user_id
      JOIN lots l ON r.lot_id = l.lot_id
      WHERE r.is_ongoing = true
    `);
    res.json(live.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 4. GET total revenue and payment records
router.get('/revenue', verifyAdmin, async (req, res) => {
  try {
    const payments = await pool.query(`
      SELECT p.*, u.name as user_name 
      FROM payments p
      JOIN reservations r ON p.reserve_id = r.reserve_id
      JOIN users u ON r.user_id = u.user_id
      ORDER BY p.transaction_date DESC
    `);
    res.json(payments.rows);
  } catch (err) {
    console.error("SQL ERROR IN REVENUE:", err.message);
    res.status(500).send("Server Error");
  }
});

// 5. NEW: GET Master Transaction Log (Ongoing + Checked Out)
// This fulfills the requirement to see status, fare, and times for all users
router.get('/all-transactions', verifyAdmin, async (req, res) => {
    try {
      const transactions = await pool.query(`
        SELECT 
          r.reserve_id,
          u.name as user_name,
          l.prime_loc,
          r.spot_id,
          r.vehicle_num,
          r.start_time,
          r.end_time,
          r.is_ongoing,
          p.total_amt as fare
        FROM reservations r
        JOIN users u ON r.user_id = u.user_id
        JOIN lots l ON r.lot_id = l.lot_id
        LEFT JOIN payments p ON r.reserve_id = p.reserve_id
        ORDER BY r.start_time DESC
      `);
      res.json(transactions.rows);
    } catch (err) {
      console.error("SQL ERROR IN TRANSACTIONS:", err.message);
      res.status(500).send("Server Error");
    }
  });

  // 6. DELETE a parking lot and its spots
  router.get('/lots/:lotId', verifyAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
      const { lotId } = req.params;
      await client.query('BEGIN');

      // First, delete the spots associated with this lot
      await client.query("DELETE FROM spots WHERE lot_id = $1", [lotId]);
      
      // Then, delete the lot itself
      await client.query("DELETE FROM lots WHERE lot_id = $1", [lotId]);

      await client.query('COMMIT');
      res.json({ message: "Parking lot and all associated spots deleted successfully" });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err.message);
      res.status(500).send("Server Error: Check if lot has active reservations");
    } finally {
      client.release();
    }
  });

module.exports = router;