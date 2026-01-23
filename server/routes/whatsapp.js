const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all posts
router.get('/', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const sql = 'SELECT * FROM whatsapp_posts ORDER BY created_at DESC LIMIT ?';
    db.all(sql, [limit], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST new post (protected would be better, but simplified here as per key-less design)
router.post('/', (req, res) => {
    const { content, image, date } = req.body;
    const sql = 'INSERT INTO whatsapp_posts (content, image, created_at) VALUES (?, ?, ?)';
    // Use provided date or current time
    const postDate = date || new Date().toISOString();

    db.run(sql, [content, image, postDate], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            id: this.lastID,
            content,
            image,
            created_at: postDate
        });
    });
});

// DELETE post
router.delete('/:id', (req, res) => {
    const sql = 'DELETE FROM whatsapp_posts WHERE id = ?';
    db.run(sql, req.params.id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Post deleted', changes: this.changes });
    });
});

module.exports = router;
