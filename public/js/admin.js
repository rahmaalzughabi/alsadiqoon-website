// Al-Sadiqoon Admin Panel Logic

const API_URL = '/api';
let token = localStorage.getItem('token');
let currentUser = null;

// ===================================
// Authentication
// ===================================
async function checkAuth() {
    if (!token) {
        showLogin();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.valid) {
            currentUser = data.user;
            showDashboard();
            updateStats();
        } else {
            logout();
        }
    } catch (error) {
        logout();
    }
}

function showLogin() {
    document.getElementById('loginView').style.display = 'block';
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('userNav').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginView').style.display = 'none';
    document.getElementById('dashboardView').style.display = 'flex';
    document.getElementById('userNav').style.display = 'block';
}

function logout() {
    localStorage.removeItem('token');
    token = null;
    currentUser = null;
    showLogin();
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (result.success) {
            token = result.token;
            localStorage.setItem('token', token);
            checkAuth();
        } else {
            alert('بيانات الدخول غير صحيحة');
        }
    } catch (error) {
        alert('حدث خطأ في الاتصال');
    }
});

// ===================================
// Dashboard Navigation
// ===================================
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
}

// ===================================
// News Management
// ===================================
async function loadNews() {
    try {
        const response = await fetch(`${API_URL}/news?limit=100`);
        const news = await response.json();

        const tbody = document.getElementById('newsTableBody');
        tbody.innerHTML = news.map(item => `
            <tr>
                <td>${item.title}</td>
                <td><span class="status-badge status-warning">${item.category}</span></td>
                <td>${new Date(item.published_date).toLocaleDateString('ar-IQ')}</td>
                <td>
                    <button onclick="editNews(${item.id})" class="btn btn-secondary btn-sm"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteNews(${item.id})" class="btn btn-secondary btn-sm" style="color: red;"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

function showAddNewsModal() {
    document.getElementById('newsForm').reset();
    document.querySelector('input[name="id"]').value = '';
    document.getElementById('newsModalTitle').textContent = 'إضافة خبر جديد';
    document.getElementById('newsModal').style.display = 'flex';
}

async function editNews(id) {
    try {
        const response = await fetch(`${API_URL}/news/${id}`);
        const item = await response.json();

        const form = document.getElementById('newsForm');
        form.querySelector('input[name="id"]').value = item.id;
        form.querySelector('input[name="title"]').value = item.title;
        form.querySelector('select[name="category"]').value = item.category;
        form.querySelector('textarea[name="content"]').value = item.content;
        form.querySelector('input[name="image"]').value = item.image || '';

        document.getElementById('newsModalTitle').textContent = 'تعديل الخبر';
        document.getElementById('newsModal').style.display = 'flex';
    } catch (error) {
        alert('خطأ في تحميل البيانات');
    }
}

async function deleteNews(id) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    try {
        await fetch(`${API_URL}/news/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadNews();
        updateStats();
    } catch (error) {
        alert('خطأ في الحذف');
    }
}

document.getElementById('newsForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Handle image upload first
    const imageInput = document.getElementById('newsImageInput');
    let imagePath = e.target.querySelector('input[name="image"]').value;

    if (imageInput.files.length > 0) {
        const formData = new FormData();
        formData.append('image', imageInput.files[0]);

        try {
            const uploadRes = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            const result = await uploadRes.json();
            if (result.success) {
                imagePath = result.path;
            }
        } catch (error) {
            console.error('Upload error:', error);
        }
    }

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.image = imagePath;

    const id = data.id;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/news/${id}` : `${API_URL}/news`;

    try {
        await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        closeModal('newsModal');
        loadNews();
        updateStats();
    } catch (error) {
        alert('خطأ في الحفظ');
    }
});

// ===================================
// WhatsApp Management
// ===================================
async function loadWhatsAppPosts() {
    try {
        const response = await fetch(`${API_URL}/whatsapp?limit=50`);
        const posts = await response.json();

        const tbody = document.getElementById('whatsappTableBody');
        tbody.innerHTML = posts.map(item => `
            <tr>
                <td><div style="max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.content || '(صورة فقط)'}</div></td>
                <td>${item.image ? `<a href="${item.image}" target="_blank"><img src="${item.image}" style="width:30px; height:30px; border-radius:4px; object-fit:cover;"></a>` : '-'}</td>
                <td>${new Date(item.created_at).toLocaleDateString('ar-IQ')} ${new Date(item.created_at).toLocaleTimeString('ar-IQ')}</td>
                <td>
                    <button onclick="deleteWhatsAppPost('${item.id}')" class="btn btn-secondary btn-sm" style="color: red;"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading whatsapp posts:', error);
    }
}

document.getElementById('quickWhatsAppForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري النشر...';
    btn.disabled = true;

    // Handle image upload
    const imageInput = document.getElementById('quickWhatsImage');
    let imagePath = '';

    if (imageInput.files.length > 0) {
        const formData = new FormData();
        formData.append('image', imageInput.files[0]);
        try {
            const uploadRes = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
            const result = await uploadRes.json();
            if (result.success) imagePath = result.path;
        } catch (error) {
            console.error('Upload error:', error);
        }
    }

    const content = e.target.querySelector('textarea[name="content"]').value;

    try {
        await fetch(`${API_URL}/whatsapp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, image: imagePath })
        });

        e.target.reset();
        loadWhatsAppPosts();
    } catch (error) {
        alert('خطأ في النشر');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

async function deleteWhatsAppPost(id) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
        await fetch(`${API_URL}/whatsapp/${id}`, { method: 'DELETE' });
        loadWhatsAppPosts();
    } catch (error) {
        alert('خطأ في الحذف');
    }
}

// ===================================
// Utilities
// ===================================
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function updateStats() {
    try {
        const newsRes = await fetch(`${API_URL}/news?limit=1000`);
        const news = await newsRes.json();
        document.getElementById('stats-news').textContent = news.length;

        const actsRes = await fetch(`${API_URL}/activities?limit=1000`);
        const acts = await actsRes.json();
        document.getElementById('stats-activities').textContent = acts.length;
    } catch (error) {
        console.error('Stats error:', error);
    }
}

async function syncWhatsApp() {
    const btn = document.getElementById('syncBtn');
    const originalText = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري المزامنة...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/news/sync/whatsapp`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();

        if (result.success) {
            alert(result.message);
            loadNews();
            updateStats();
        } else {
            alert('فشل في المزامنة: ' + (result.error || 'خطأ غير معروف'));
        }
    } catch (error) {
        console.error(error);
        alert('حدث خطأ في الاتصال بالخادم');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Initialize
checkAuth();
