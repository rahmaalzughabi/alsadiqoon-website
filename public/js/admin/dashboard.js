function showSection(sectionId) {
    // Update active nav
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
    document.getElementById(`nav-${sectionId}`).classList.add('active');

    // Show section content
    document.querySelectorAll('.admin-content > div').forEach(div => div.style.display = 'none');
    document.getElementById(`section-${sectionId}`).style.display = 'block';

    if (sectionId === 'news') loadNews();
    if (sectionId === 'activities') loadActivities();
    if (sectionId === 'whatsapp') loadWhatsAppPosts();
    if (sectionId === 'audit') {
        loadAuditLogs();
        populateAuditFilters();
    }
}

async function updateStats() {
    try {
        const newsRes = await fetch(`${API_URL}/news?limit=1000`);
        const news = await newsRes.json();
        const newsStats = document.getElementById('stats-news');
        if (newsStats) newsStats.textContent = news.length;

        const actsRes = await fetch(`${API_URL}/activities?limit=1000`);
        const acts = await actsRes.json();
        const actStats = document.getElementById('stats-activities');
        if (actStats) actStats.textContent = acts.length;
    } catch (error) {
        console.error('Stats error:', error);
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const colors = {
        success: '#50c878',
        error: '#ef4444',
        warning: '#d4af37',
        info: '#0066cc'
    };

    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: var(--bg-surface);
        color: var(--text-main);
        padding: 16px 24px;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        border: 1px solid ${colors[type]}40;
        border-right: 4px solid ${colors[type]};
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 500px;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    notification.innerHTML = `
        <i class="${icons[type]}" style="color: ${colors[type]}; font-size: 1.2rem;"></i>
        <span style="flex: 1;">${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem; padding: 0; margin: 0;">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-100px)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Initial check
checkAuth();

