const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get recent audit logs
router.get('/', authenticateToken, (req, res) => {
    const limit = req.query.limit || 50;
    db.all('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?', [limit], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

module.exports = router;
