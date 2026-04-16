const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. Registration Route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, is_admin } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, hashedPassword, is_admin || false]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Email already exists or database error" });
  }
});

// 2. Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { user_id: user.rows[0].user_id, is_admin: user.rows[0].is_admin },
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: { user_id: user.rows[0].user_id, name: user.rows[0].name, is_admin: user.rows[0].is_admin }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;