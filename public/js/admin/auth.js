async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/auth/verify`);
        const data = await response.json();

        if (data.valid) {
            currentUser = data.user;
            showDashboard();
            updateStats();
        } else {
            showLogin();
        }
    } catch (error) {
        showLogin();
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

async function logout() {
    try {
        await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
    } catch (e) { console.error(e); }

    localStorage.removeItem('token'); // Cleanup legacy just in case
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
            checkAuth();
        } else {
            alert('بيانات الدخول غير صحيحة');
        }
    } catch (error) {
        alert('حدث خطأ في الاتصال');
    }
});
