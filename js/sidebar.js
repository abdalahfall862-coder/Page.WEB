// sidebar.js — Sidebar mobile MethShop

function toggleSidebar() {
    const sidebar  = document.getElementById('sidebar');
    const overlay  = document.getElementById('sidebar-overlay');
    const isOpen   = !sidebar.classList.contains('translate-x-full');

    if (isOpen) {
        sidebar.classList.add('translate-x-full');
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    } else {
        sidebar.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function updateSidebar() {
    const user          = JSON.parse(localStorage.getItem('user') || '{}');
    const token         = localStorage.getItem('token');
    const sidebarUser   = document.getElementById('sidebar-user');
    const sidebarLogin  = document.getElementById('sidebar-login-btn');
    const sidebarLogout = document.getElementById('sidebar-logout-btn');
    const sidebarName   = document.getElementById('sidebar-username');
    const sidebarAvatar = document.getElementById('sidebar-avatar');

    if (token && user.name) {
        sidebarUser.classList.remove('hidden');
        sidebarLogin.classList.add('hidden');
        sidebarLogout.classList.remove('hidden');
        sidebarName.textContent = user.name;
        sidebarAvatar.textContent = user.name.charAt(0).toUpperCase();
    } else {
        sidebarUser.classList.add('hidden');
        sidebarLogin.classList.remove('hidden');
        sidebarLogout.classList.add('hidden');
    }
}

// Fermer avec la touche Échap
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar.classList.contains('translate-x-full')) {
            toggleSidebar();
        }
    }
});

document.addEventListener('DOMContentLoaded', updateSidebar);