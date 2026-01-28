const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const db = require('./database');
const cookieParser = require('cookie-parser');
const sharp = require('sharp');
const fs = require('fs');

const rateLimit = require('express-rate-limit');
const { authenticateToken, JWT_SECRET } = require('./middleware/auth');
const jwt = require('jsonwebtoken');

const app = express();
app.set('trust proxy', 1); // For Railway/Reverse Proxy
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Security Headers Middleware
app.use((req, res, next) => {
    // Content-Security-Policy
    res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self'");

    // Strict-Transport-Security
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

    // X-Frame-Options
    res.setHeader("X-Frame-Options", "SAMEORIGIN");

    // X-Content-Type-Options
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Remove sensitive headers
    res.removeHeader("X-Powered-By");

    next();
});

// Rate Limiter
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: { error: 'Too many login attempts, please try again after 15 minutes' }
});

app.use('/api/auth/login', loginLimiter);

// Protected Admin Routes
app.get('/admin', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/admin/login');

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.redirect('/admin/login');
        res.sendFile(path.join(__dirname, 'views', 'admin_dashboard.html'));
    });
});

app.get('/admin/login', (req, res) => {
    const token = req.cookies.token;
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err) return res.redirect('/admin');
            res.sendFile(path.join(__dirname, 'views', 'login.html'));
        });
    } else {
        res.sendFile(path.join(__dirname, 'views', 'login.html'));
    }
});

// Homepage with Initial Payload Injection (Poor Man's SSR)
app.get('/', (req, res) => {
    db.all('SELECT title, category, published_date, image FROM news ORDER BY published_date DESC LIMIT 3', [], (err, news) => {
        const initialData = { news: news || [] };

        fs.readFile(path.join(__dirname, '..', 'public', 'index.html'), 'utf8', (err, html) => {
            if (err) return res.status(500).send('Error loading page');

            // Inject initial data
            const injectedHtml = html.replace(
                '</head>',
                `<script>window.INITIAL_DATA = ${JSON.stringify(initialData)};</script></head>`
            );

            res.send(injectedHtml);
        });
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

// Upload endpoint
// Upload endpoint with WebP conversion
app.post('/api/upload', upload.single('image'), async (req, res) => {
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

// API Routes
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const sectionsRoutes = require('./routes/sections');
const activitiesRoutes = require('./routes/activities');
const whatsappRoutes = require('./routes/whatsapp');

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/sections', sectionsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/audit', require('./routes/audit'));

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
