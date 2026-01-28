async function loadSections() {
    try {
        const response = await fetch(`${API_URL}/sections`);
        const sections = await response.json();

        const tbody = document.getElementById('sectionsTableBody');
        if (!tbody) return;

        tbody.innerHTML = sections.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.slug}</td>
                <td>${item.order_index || 0}</td>
                <td>
                    <span class="status-badge ${item.is_active ? 'status-success' : 'status-warning'}">
                        ${item.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                </td>
                <td>
                    <button onclick="editSection(${item.id})" class="btn btn-secondary btn-sm" title="تعديل">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading sections:', error);
    }
}

async function editSection(id) {
    try {
        const response = await fetch(`${API_URL}/sections`);
        const sections = await response.json();
        const section = sections.find(s => s.id === id);

        if (!section) {
            alert('القسم غير موجود');
            return;
        }

        const modal = document.getElementById('sectionModal');
        const form = document.getElementById('sectionForm');

        form.querySelector('[name="id"]').value = section.id;
        form.querySelector('[name="name"]').value = section.name;
        form.querySelector('[name="content"]').value = section.content || '';
        form.querySelector('[name="order_index"]').value = section.order_index || 0;
        form.querySelector('[name="is_active"]').value = section.is_active ? '1' : '0';

        modal.style.display = 'flex';
    } catch (error) {
        alert('خطأ في تحميل بيانات القسم');
    }
}

// Section form submission
if (document.getElementById('sectionForm')) {
    document.getElementById('sectionForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            content: formData.get('content'),
            order_index: parseInt(formData.get('order_index')),
            is_active: parseInt(formData.get('is_active'))
        };

        const id = formData.get('id');

        try {
            const response = await fetch(`${API_URL}/sections/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                closeModal('sectionModal');
                loadSections();
                alert('تم تحديث القسم بنجاح');
            } else {
                alert('حدث خطأ في الحفظ');
            }
        } catch (error) {
            alert('خطأ في الاتصال بالخادم');
        }
    });
}
