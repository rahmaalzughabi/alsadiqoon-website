const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'alsadiqoon.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // News table
  db.run(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image TEXT,
      category TEXT DEFAULT 'general',
      source TEXT DEFAULT 'manual',
      published_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sections table
  db.run(`
    CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT,
      order_index INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1
    )
  `);

  // Activities table
  db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      image TEXT,
      date DATE,
      location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // WhatsApp Posts table
  db.run(`
    CREATE TABLE IF NOT EXISTS whatsapp_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      image TEXT,
      external_link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Audit Logs table
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      details TEXT,
      performed_by TEXT,
      ip_address TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default admin user (username: alaa, password: alzughabi1)
  const defaultPassword = bcrypt.hashSync('alzughabi1', 10);
  db.run(`
    INSERT OR IGNORE INTO users (username, password_hash, role)
    VALUES ('alaa', ?, 'admin')
  `, [defaultPassword]);

  // Insert default sections
  const sections = [
    { name: 'الصادقون', slug: 'home', order: 1 },
    { name: 'التنظيم السياسي', slug: 'political', order: 2 },
    { name: 'التنفيذي', slug: 'executive', order: 3 },
    { name: 'بناء الدولة', slug: 'state-building', order: 4 },
    { name: 'العلاقات', slug: 'relations', order: 5 },
    { name: 'أخبار الصادقون', slug: 'news', order: 6 },
    { name: 'الأنشطة', slug: 'activities', order: 7 },
    { name: 'الاتصال والدعم', slug: 'contact', order: 8 }
  ];

  sections.forEach(section => {
    db.run(`
      INSERT OR IGNORE INTO sections (name, slug, content, order_index)
      VALUES (?, ?, ?, ?)
    `, [section.name, section.slug, `محتوى قسم ${section.name}`, section.order]);
  });

  // Sample news insertion removed as per user request to start clean.
});

console.log('Database initialized successfully at:', dbPath);

module.exports = db;
