const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all activities (public)
router.get('/', (req, res) => {
    const { limit = 20 } = req.query;

    db.all(
        'SELECT * FROM activities ORDER BY date DESC LIMIT ?',
        [parseInt(limit)],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(rows);
        }
    );
});

// Get single activity (public)
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM activities WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        res.json(row);
    });
});

// Create activity (protected)
router.post('/', authenticateToken, (req, res) => {
    const { title, description, image, date, location } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title required' });
    }

    db.run(
        'INSERT INTO activities (title, description, image, date, location) VALUES (?, ?, ?, ?, ?)',
        [title, description, image, date, location],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ success: true, id: this.lastID });
        }
    );
});

// Update activity (protected)
router.put('/:id', authenticateToken, (req, res) => {
    const { title, description, image, date, location } = req.body;

    db.run(
        'UPDATE activities SET title = ?, description = ?, image = ?, date = ?, location = ? WHERE id = ?',
        [title, description, image, date, location, req.params.id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Activity not found' });
            }
            res.json({ success: true });
        }
    );
});

// Delete activity (protected)
router.delete('/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM activities WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        res.json({ success: true });
    });
});

module.exports = router;
