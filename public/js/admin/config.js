const API_URL = '/api';
let token = localStorage.getItem('token');
let currentUser = null;

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}
