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
