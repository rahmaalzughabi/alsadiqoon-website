const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all news (public)
router.get('/', (req, res) => {
    const { category, limit = 50 } = req.query;

    let query = 'SELECT * FROM news';
    let params = [];

    if (category) {
        query += ' WHERE category = ?';
        params.push(category);
    }

    query += ' ORDER BY published_date DESC LIMIT ?';
    params.push(parseInt(limit));

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Get single news item (public)
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM news WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'News not found' });
        }
        res.json(row);
    });
});

// Create news (protected)
router.post('/', authenticateToken, (req, res) => {
    const { title, content, image, category, source = 'manual' } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content required' });
    }

    db.run(
        'INSERT INTO news (title, content, image, category, source) VALUES (?, ?, ?, ?, ?)',
        [title, content, image, category, source],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ success: true, id: this.lastID });
        }
    );
});

// Update news (protected)
router.put('/:id', authenticateToken, (req, res) => {
    const { title, content, image, category } = req.body;

    db.run(
        'UPDATE news SET title = ?, content = ?, image = ?, category = ? WHERE id = ?',
        [title, content, image, category, req.params.id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'News not found' });
            }
            res.json({ success: true });
        }
    );
});

// Delete news (protected)
router.delete('/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM news WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'News not found' });
        }
        res.json({ success: true });
    });
});

// WhatsApp Sync endpoint removed per user request


module.exports = router;
