const jwt = require('jsonwebtoken');

const JWT_SECRET = 'alsadiqoon-secret-key-2026'; // في الإنتاج، استخدم متغير بيئة

function authenticateToken(req, res, next) {
    // Check Authorization header first, then cookies
    const authHeader = req.headers['authorization'];
    const token = (authHeader && authHeader.split(' ')[1]) || req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

module.exports = { authenticateToken, JWT_SECRET };
