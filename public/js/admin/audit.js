async function loadAuditLogs() {
    try {
        const response = await fetch(`${API_URL}/audit?limit=100`);
        const logs = await response.json();

        const tbody = document.getElementById('auditTableBody');
        if (!tbody) return;

        tbody.innerHTML = logs.map(item => `
            <tr>
                <td>${item.action}</td>
                <td>${item.details}</td>
                <td>${item.performed_by || '-'}</td>
                <td><span style="direction: ltr; display: inline-block">${item.ip_address || '-'}</span></td>
                <td>${new Date(item.timestamp).toLocaleDateString('ar-IQ')} ${new Date(item.timestamp).toLocaleTimeString('ar-IQ')}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading audit logs:', error);
    }
}
