const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all sections (public)
router.get('/', (req, res) => {
    db.all(
        'SELECT * FROM sections WHERE is_active = 1 ORDER BY order_index',
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(rows);
        }
    );
});

// Get section by slug (public)
router.get('/:slug', (req, res) => {
    db.get(
        'SELECT * FROM sections WHERE slug = ? AND is_active = 1',
        [req.params.slug],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (!row) {
                return res.status(404).json({ error: 'Section not found' });
            }
            res.json(row);
        }
    );
});

// Update section (protected)
router.put('/:id', authenticateToken, (req, res) => {
    const { name, content, order_index, is_active } = req.body;

    db.run(
        'UPDATE sections SET name = ?, content = ?, order_index = ?, is_active = ? WHERE id = ?',
        [name, content, order_index, is_active, req.params.id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Section not found' });
            }
            res.json({ success: true });
        }
    );
});

module.exports = router;
