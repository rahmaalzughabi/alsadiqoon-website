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
                    <button onclick="deleteActivity(${item.id})" class="btn btn-danger btn-action" title="حذف"><i class="fas fa-trash"></i> حذف</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}

// Placeholder for missing modal functions to prevent errors
function showAddActivityModal() {
    alert("ميزة إضافة النشاطات قيد التطوير");
}

async function deleteActivity(id) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    try {
        await fetch(`${API_URL}/activities/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadActivities();
        updateStats();
    } catch (error) {
        alert('خطأ في الحذف');
    }
}
