function showSection(sectionId) {
    // Update active nav
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
    document.getElementById(`nav-${sectionId}`).classList.add('active');

    // Show section content
    document.querySelectorAll('.admin-content > div').forEach(div => div.style.display = 'none');
    document.getElementById(`section-${sectionId}`).style.display = 'block';

    if (sectionId === 'news') loadNews();
    if (sectionId === 'activities') loadActivities();
    if (sectionId === 'sections') loadSections();
    if (sectionId === 'whatsapp') loadWhatsAppPosts();
    if (sectionId === 'audit') loadAuditLogs();
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

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Initial check
checkAuth();
updateStats();
