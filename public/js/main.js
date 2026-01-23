// Al-Sadiqoon Website - Main JavaScript
// موقع الصادقون - JavaScript الرئيسي

// API Base URL
const API_URL = window.location.origin + '/api';

// ===================================
// Header Scroll Effect
// ===================================
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ===================================
// Mobile Menu Toggle
// ===================================
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (nav.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
            nav.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// ===================================
// Theme Toggler
// ===================================
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

// Check for saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
htmlElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    if (theme === 'light') {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
}

// ===================================
// Fetch and Display News
// ===================================
async function loadNews(limit = 6) {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;

    try {
        const response = await fetch(`${API_URL}/news?limit=${limit}`);
        const news = await response.json();

        if (news.length === 0) {
            newsGrid.innerHTML = `
                <div style="text-align: center; padding: 40px; grid-column: 1/-1;">
                    <p style="color: var(--text-muted); font-size: 1.2rem;">لا توجد أخبار حالياً</p>
                </div>
            `;
            return;
        }

        newsGrid.innerHTML = news.map(item => `
            <div class="card">
                ${item.image ? `<img src="${item.image}" alt="${item.title}" class="card-image">` : ''}
                <span class="card-category">${item.category || 'عام'}</span>
                <h3 class="card-title">${item.title}</h3>
                <p class="card-content">${truncateText(item.content, 150)}</p>
                <div class="card-meta">
                    <span><i class="fas fa-calendar"></i> ${formatDate(item.published_date)}</span>
                    <a href="/sections/news-detail.html?id=${item.id}" class="btn-link">
                        قراءة المزيد <i class="fas fa-arrow-left"></i>
                    </a>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading news:', error);
        newsGrid.innerHTML = `
            <div style="text-align: center; padding: 40px; grid-column: 1/-1;">
                <p style="color: var(--text-muted);">حدث خطأ في تحميل الأخبار</p>
            </div>
        `;
    }
}

// ===================================
// Fetch and Display Activities
// ===================================
async function loadActivities(limit = 3) {
    const activitiesGrid = document.getElementById('activitiesGrid');
    if (!activitiesGrid) return;

    try {
        const response = await fetch(`${API_URL}/activities?limit=${limit}`);
        const activities = await response.json();

        if (activities.length === 0) {
            activitiesGrid.innerHTML = `
                <div style="text-align: center; padding: 40px; grid-column: 1/-1;">
                    <p style="color: var(--text-muted); font-size: 1.2rem;">لا توجد أنشطة حالياً</p>
                </div>
            `;
            return;
        }

        activitiesGrid.innerHTML = activities.map(item => `
            <div class="card">
                ${item.image ? `<img src="${item.image}" alt="${item.title}" class="card-image">` : ''}
                <h3 class="card-title">${item.title}</h3>
                <p class="card-content">${truncateText(item.description || '', 120)}</p>
                <div class="card-meta">
                    <span><i class="fas fa-calendar"></i> ${formatDate(item.date)}</span>
                    ${item.location ? `<span><i class="fas fa-map-marker-alt"></i> ${item.location}</span>` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading activities:', error);
        activitiesGrid.innerHTML = `
            <div style="text-align: center; padding: 40px; grid-column: 1/-1;">
                <p style="color: var(--text-muted);">حدث خطأ في تحميل الأنشطة</p>
            </div>
        `;
    }
}

// ===================================
// Utility Functions
// ===================================
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ar-IQ', options);
}

// ===================================
// Smooth Scroll for Anchor Links
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===================================
// Intersection Observer for Animations
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all cards
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.card').forEach(card => {
        observer.observe(card);
    });
});

// ===================================
// Initialize on Page Load
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    // Load news and activities on homepage
    if (document.getElementById('newsGrid')) {
        loadNews(6);
    }
    if (document.getElementById('activitiesGrid')) {
        loadActivities(3);
    }
    if (document.getElementById('whatsappFeed')) {
        loadWhatsAppFeed();
    }
});

// ===================================
// Export functions for use in other pages
// ===================================
window.AlSadiqoon = {
    loadNews,
    loadActivities,
    formatDate,
    truncateText,
    API_URL
};
