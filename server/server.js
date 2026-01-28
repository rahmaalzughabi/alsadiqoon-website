const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const db = require('./database');
const cookieParser = require('cookie-parser');
const sharp = require('sharp');
const fs = require('fs');

// Try to load compression (optional)
let compression;
try {
    compression = require('compression');
    console.log('✅ Compression (GZIP) enabled');
} catch (e) {
    console.log('⚠️  Compression module not found - running without GZIP compression');
    console.log('   Install with: npm install compression');
}

const rateLimit = require('express-rate-limit');
const { authenticateToken, JWT_SECRET } = require('./middleware/auth');
const jwt = require('jsonwebtoken');

const app = express();
app.set('trust proxy', 1); // For Railway/Reverse Proxy
const PORT = process.env.PORT || 3000;

// Compression middleware (GZIP) - Only if available
if (compression) {
    app.use(compression({
        level: 6, // Compression level (0-9)
        threshold: 1024, // Only compress responses larger than 1KB
        filter: (req, res) => {
            if (req.headers['x-no-compression']) return false;
            return compression.filter(req, res);
        }
    }));
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Limit request body size
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files with caching
app.use(express.static(path.join(__dirname, '..', 'public'), {
    maxAge: '1d', // Cache static files for 1 day
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        // Cache images and fonts longer
        if (filePath.match(/\.(jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf|eot)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
        }
        // Cache CSS and JS for shorter time
        if (filePath.match(/\.(css|js)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
        }
    }
}));

// Enhanced Security Headers Middleware
app.use((req, res, next) => {
    // Content-Security-Policy (Enhanced)
    res.setHeader("Content-Security-Policy",
        "default-src 'self'; " +
        "img-src 'self' data: https:; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
        "script-src 'self' 'unsafe-inline'; " +
        "font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
        "connect-src 'self'; " +
        "frame-ancestors 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'"
    );

    // Strict-Transport-Security (HSTS)
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

    // X-Frame-Options
    res.setHeader("X-Frame-Options", "DENY");

    // X-Content-Type-Options
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Referrer-Policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    // Permissions-Policy (formerly Feature-Policy)
    res.setHeader("Permissions-Policy",
        "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()"
    );

    // X-XSS-Protection (Legacy but still useful)
    res.setHeader("X-XSS-Protection", "1; mode=block");

    // Remove sensitive headers
    res.removeHeader("X-Powered-By");
    res.removeHeader("Server");

    next();
});

// Enhanced Rate Limiters
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: { error: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
    // Progressive delay
    skipSuccessfulRequests: true
});

// Strict rate limiter for admin routes
const adminLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: { error: 'Too many requests from this IP' }
});

// Apply rate limiters
app.use('/api/auth/login', loginLimiter);
app.use('/admin', adminLimiter);
app.use('/api', adminLimiter);

// Admin Authentication Middleware
function requireAdminAuth(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        // Return 401 for API requests, redirect for page requests
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        return res.redirect('/admin/login');
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            if (req.path.startsWith('/api/')) {
                return res.status(403).json({ error: 'Invalid or expired token' });
            }
            return res.redirect('/admin/login');
        }

        // Check if user has admin role
        if (user.role !== 'admin') {
            if (req.path.startsWith('/api/')) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            return res.status(403).send('Access Denied');
        }

        req.user = user;
        next();
    });
}

// Protected Admin Routes - Server-side gating
app.get('/admin', requireAdminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_dashboard.html'));
});

// All admin sub-routes are protected (using regex)
app.get(/^\/admin\/(?!login).*/, requireAdminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_dashboard.html'));
});

// Login page - redirect if already authenticated
app.get('/admin/login', (req, res) => {
    const token = req.cookies.token;
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err && user.role === 'admin') {
                return res.redirect('/admin');
            }
            res.sendFile(path.join(__dirname, 'views', 'login.html'));
        });
    } else {
        res.sendFile(path.join(__dirname, 'views', 'login.html'));
    }
});

// Homepage with Enhanced SSR (Server-Side Rendering)
app.get('/', (req, res) => {
    // Fetch both news and activities in parallel
    Promise.all([
        new Promise((resolve, reject) => {
            db.all('SELECT title, category, published_date, image FROM news ORDER BY published_date DESC LIMIT 5', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        }),
        new Promise((resolve, reject) => {
            db.all('SELECT title, date, location, image FROM activities ORDER BY date DESC LIMIT 3', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        })
    ])
        .then(([news, activities]) => {
            const initialData = {
                news: news,
                activities: activities,
                timestamp: new Date().toISOString()
            };

            fs.readFile(path.join(__dirname, '..', 'public', 'index.html'), 'utf8', (err, html) => {
                if (err) {
                    console.error('Error reading index.html:', err);
                    return res.status(500).send('Error loading page');
                }

                // Inject initial data with proper escaping
                const safeData = JSON.stringify(initialData).replace(/</g, '\\u003c');
                const injectedHtml = html.replace(
                    '</head>',
                    `<script>window.INITIAL_DATA = ${safeData};</script></head>`
                );

                // Set caching headers for homepage
                res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
                res.send(injectedHtml);
            });
        })
        .catch(err => {
            console.error('Database error:', err);
            // Send page without data on error
            res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
        });
});

// Disable X-Powered-By at app level as well
app.disable('x-powered-by');

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'public', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Upload endpoint - Protected
app.post('/api/upload', requireAdminAuth, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const filePath = req.file.path;
        const fileDir = path.dirname(filePath);
        const fileNameWithoutExt = path.parse(req.file.filename).name;
        const newFileName = `${fileNameWithoutExt}.webp`;
        const newFilePath = path.join(fileDir, newFileName);

        await sharp(filePath)
            .webp({ quality: 80 })
            .toFile(newFilePath);

        // Delete original file
        fs.unlinkSync(filePath);

        // Log upload action
        db.run(`INSERT INTO audit_logs (action, details, performed_by, ip_address) VALUES (?, ?, ?, ?)`,
            ['UPLOAD', `Uploaded image: ${newFileName}`, req.user.username, req.ip || req.connection.remoteAddress]);

        res.json({
            success: true,
            filename: newFileName,
            path: `/uploads/${newFileName}`
        });
    } catch (error) {
        console.error('Image processing error:', error);
        res.status(500).json({ error: 'Image processing failed' });
    }
});

// API Routes - All protected except auth
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const sectionsRoutes = require('./routes/sections');
const activitiesRoutes = require('./routes/activities');
const whatsappRoutes = require('./routes/whatsapp');

// Auth routes are public (login/logout)
app.use('/api/auth', authRoutes);

// All other API routes require authentication
app.use('/api/news', requireAdminAuth, newsRoutes);
app.use('/api/sections', requireAdminAuth, sectionsRoutes);
app.use('/api/activities', requireAdminAuth, activitiesRoutes);
app.use('/api/whatsapp', requireAdminAuth, whatsappRoutes);
app.use('/api/audit', requireAdminAuth, require('./routes/audit'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Al-Sadiqoon API is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Al-Sadiqoon server running on http://localhost:${PORT}`);
    console.log(`📊 Database: alsadiqoon.db`);
    console.log(`🔐 Default admin credentials: username=alaa, password=alzughabi1`);
});

module.exports = app;
