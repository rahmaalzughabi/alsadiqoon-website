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
                    <button onclick="editNews(${item.id})" class="btn btn-primary btn-action" title="تعديل"><i class="fas fa-edit"></i> تعديل</button>
                    <button onclick="deleteNews(${item.id})" class="btn btn-danger btn-action" title="حذف"><i class="fas fa-trash"></i> حذف</button>
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
