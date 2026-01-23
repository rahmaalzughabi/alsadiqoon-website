const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

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
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({
        success: true,
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`
    });
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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Al-Sadiqoon API is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Al-Sadiqoon server running on http://localhost:${PORT}`);
    console.log(`📊 Database: alsadiqoon.db`);
    console.log(`🔐 Default admin credentials: username=admin, password=admin123`);
});

module.exports = app;
