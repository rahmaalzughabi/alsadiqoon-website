async function loadActivities() {
    try {
        const response = await fetch(`${API_URL}/activities?limit=100`);
        const activities = await response.json();

        const tbody = document.getElementById('activitiesTableBody');
        if (!tbody) return;

        tbody.innerHTML = activities.map(item => `
            <tr>
                <td>${item.title}</td>
                <td>${new Date(item.date).toLocaleDateString('ar-IQ')}</td>
                <td>${item.location || '-'}</td>
                <td>
                    <button onclick="editActivity(${item.id})" class="btn btn-secondary btn-sm" title="تعديل" style="margin-left: 5px;">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button onclick="deleteActivity(${item.id})" class="btn btn-danger btn-sm" title="حذف">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}

function showAddActivityModal() {
    const modal = document.getElementById('activityModal');
    const form = document.getElementById('activityForm');
    const title = document.getElementById('activityModalTitle');

    title.textContent = 'إضافة نشاط جديد';
    form.reset();
    form.querySelector('[name="id"]').value = '';
    modal.style.display = 'flex';
}

async function editActivity(id) {
    try {
        const response = await fetch(`${API_URL}/activities/${id}`);
        const activity = await response.json();

        const modal = document.getElementById('activityModal');
        const form = document.getElementById('activityForm');
        const title = document.getElementById('activityModalTitle');

        title.textContent = 'تعديل النشاط';
        form.querySelector('[name="id"]').value = activity.id;
        form.querySelector('[name="title"]').value = activity.title;
        form.querySelector('[name="description"]').value = activity.description || '';
        form.querySelector('[name="date"]').value = activity.date;
        form.querySelector('[name="location"]').value = activity.location || '';
        form.querySelector('[name="image"]').value = activity.image || '';

        modal.style.display = 'flex';
    } catch (error) {
        alert('خطأ في تحميل بيانات النشاط');
    }
}

async function deleteActivity(id) {
    if (!confirm('هل أنت متأكد من حذف هذا النشاط؟')) return;

    try {
        await fetch(`${API_URL}/activities/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        loadActivities();
        updateStats();
        alert('تم حذف النشاط بنجاح');
    } catch (error) {
        alert('خطأ في الحذف');
    }
}

// Activity form submission
if (document.getElementById('activityForm')) {
    document.getElementById('activityForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            date: formData.get('date'),
            location: formData.get('location'),
            image: formData.get('image')
        };

        const id = formData.get('id');
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/activities/${id}` : `${API_URL}/activities`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                closeModal('activityModal');
                loadActivities();
                updateStats();
                alert(id ? 'تم تحديث النشاط بنجاح' : 'تم إضافة النشاط بنجاح');
            } else {
                alert('حدث خطأ في الحفظ');
            }
        } catch (error) {
            alert('خطأ في الاتصال بالخادم');
        }
    });
}

// Activity image upload
if (document.getElementById('activityImageInput')) {
    document.getElementById('activityImageInput').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const result = await response.json();
            if (result.url) {
                document.querySelector('#activityForm [name="image"]').value = result.url;
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    });
}
