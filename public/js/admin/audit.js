// Global variables for audit logs
let allAuditLogs = [];
let filteredLogs = [];
let autoRefreshInterval = null;

// Load audit logs with optional filters
async function loadAuditLogs(limit = 200) {
    try {
        const response = await fetch(`${API_URL}/audit?limit=${limit}`);
        if (!response.ok) throw new Error('Failed to load audit logs');
        
        allAuditLogs = await response.json();
        filteredLogs = [...allAuditLogs];
        
        applyFilters();
        displayAuditLogs();
        updateAuditStats();
    } catch (error) {
        console.error('Error loading audit logs:', error);
        showNotification('فشل تحميل سجلات النشاط', 'error');
    }
}

// Display audit logs in table
function displayAuditLogs() {
    const tbody = document.getElementById('auditTableBody');
    if (!tbody) return;

    if (filteredLogs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 10px; display: block;"></i>
                    لا توجد سجلات نشاط
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredLogs.map(item => {
        const actionColor = getActionColor(item.action);
        const actionIcon = getActionIcon(item.action);
        
        return `
            <tr style="transition: background 0.2s;">
                <td>
                    <span class="status-badge" style="background: ${actionColor}20; color: ${actionColor}; border: 1px solid ${actionColor}40;">
                        <i class="${actionIcon}" style="margin-left: 5px;"></i>
                        ${item.action}
                    </span>
                </td>
                <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;" title="${item.details}">
                    ${item.details || '-'}
                </td>
                <td>
                    <strong style="color: var(--primary-brand);">${item.performed_by || 'نظام'}</strong>
                </td>
                <td>
                    <code style="direction: ltr; display: inline-block; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px; font-size: 0.85rem;">
                        ${item.ip_address || '-'}
                    </code>
                </td>
                <td style="white-space: nowrap;">
                    <div style="font-size: 0.9rem;">${formatArabicDateTime(item.timestamp)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${getTimeAgo(item.timestamp)}</div>
                </td>
            </tr>
        `;
    }).join('');
}

// Apply filters to audit logs
function applyFilters() {
    const searchTerm = document.getElementById('auditSearch')?.value.toLowerCase() || '';
    const actionFilter = document.getElementById('auditActionFilter')?.value || 'all';
    const userFilter = document.getElementById('auditUserFilter')?.value || 'all';

    filteredLogs = allAuditLogs.filter(log => {
        const matchesSearch = !searchTerm || 
            log.action.toLowerCase().includes(searchTerm) ||
            (log.details && log.details.toLowerCase().includes(searchTerm)) ||
            (log.performed_by && log.performed_by.toLowerCase().includes(searchTerm));
        
        const matchesAction = actionFilter === 'all' || log.action === actionFilter;
        const matchesUser = userFilter === 'all' || log.performed_by === userFilter;

        return matchesSearch && matchesAction && matchesUser;
    });
}

// Update audit statistics
function updateAuditStats() {
    const totalLogs = allAuditLogs.length;
    const uniqueUsers = [...new Set(allAuditLogs.map(l => l.performed_by))].length;
    const recentLogs = allAuditLogs.filter(l => {
        const logTime = new Date(l.timestamp);
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return logTime > hourAgo;
    }).length;

    document.getElementById('totalLogsCount').textContent = totalLogs;
    document.getElementById('uniqueUsersCount').textContent = uniqueUsers;
    document.getElementById('recentLogsCount').textContent = recentLogs;
}

// Export audit logs to CSV
function exportAuditLogsCSV() {
    const headers = ['الإجراء', 'التفاصيل', 'المستخدم', 'IP', 'التوقيت'];
    const rows = filteredLogs.map(log => [
        log.action,
        log.details || '',
        log.performed_by || '',
        log.ip_address || '',
        new Date(log.timestamp).toLocaleString('ar-IQ')
    ]);

    let csvContent = '\uFEFF'; // UTF-8 BOM for Arabic support
    csvContent += headers.join(',') + '\n';
    csvContent += rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showNotification('تم تصدير السجلات بنجاح', 'success');
}

// Toggle auto-refresh
function toggleAutoRefresh() {
    const btn = document.getElementById('autoRefreshBtn');
    
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        btn.innerHTML = '<i class="fas fa-play"></i> تفعيل التحديث التلقائي';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
    } else {
        autoRefreshInterval = setInterval(() => loadAuditLogs(), 30000); // Every 30 seconds
        btn.innerHTML = '<i class="fas fa-pause"></i> إيقاف التحديث التلقائي';
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
        showNotification('التحديث التلقائي مفعّل (كل 30 ثانية)', 'success');
    }
}

// Helper: Get action color
function getActionColor(action) {
    const colors = {
        'LOGIN': '#50c878',
        'LOGOUT': '#64748b',
        'CREATE': '#0066cc',
        'UPDATE': '#d4af37',
        'DELETE': '#ef4444',
        'UPLOAD': '#8b5cf6',
        'SYNC': '#06b6d4'
    };
    return colors[action] || '#64748b';
}

// Helper: Get action icon
function getActionIcon(action) {
    const icons = {
        'LOGIN': 'fas fa-sign-in-alt',
        'LOGOUT': 'fas fa-sign-out-alt',
        'CREATE': 'fas fa-plus-circle',
        'UPDATE': 'fas fa-edit',
        'DELETE': 'fas fa-trash',
        'UPLOAD': 'fas fa-upload',
        'SYNC': 'fas fa-sync'
    };
    return icons[action] || 'fas fa-circle';
}

// Helper: Format Arabic date/time
function formatArabicDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-IQ', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Helper: Get time ago
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
}

// Populate filter dropdowns
function populateAuditFilters() {
    const actions = [...new Set(allAuditLogs.map(l => l.action))];
    const users = [...new Set(allAuditLogs.map(l => l.performed_by).filter(Boolean))];

    const actionFilter = document.getElementById('auditActionFilter');
    const userFilter = document.getElementById('auditUserFilter');

    if (actionFilter) {
        actionFilter.innerHTML = '<option value="all">جميع الإجراءات</option>' +
            actions.map(action => `<option value="${action}">${action}</option>`).join('');
    }

    if (userFilter) {
        userFilter.innerHTML = '<option value="all">جميع المستخدمين</option>' +
            users.map(user => `<option value="${user}">${user}</option>`).join('');
    }
}

// Initialize audit logs when section is shown
if (typeof showSection !== 'undefined') {
    const originalShowSection = showSection;
    showSection = function(section) {
        originalShowSection(section);
        if (section === 'audit') {
            loadAuditLogs();
        }
    };
}
