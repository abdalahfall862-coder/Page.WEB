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
        if (sidebarUser)   sidebarUser.classList.remove('hidden');
        if (sidebarLogin)  sidebarLogin.classList.add('hidden');
        if (sidebarLogout) sidebarLogout.classList.remove('hidden');
        if (sidebarName)   sidebarName.textContent = user.name;
        if (sidebarAvatar) sidebarAvatar.textContent = user.name.charAt(0).toUpperCase();
    } else {
        if (sidebarUser)   sidebarUser.classList.add('hidden');
        if (sidebarLogin)  sidebarLogin.classList.remove('hidden');
        if (sidebarLogout) sidebarLogout.classList.add('hidden');
    }

    // Lien admin discret dans navbar + sidebar
    const navAdminLink     = document.getElementById('nav-admin-link');
    const sidebarAdminLink = document.getElementById('sidebar-admin-link');
    const isAdmin          = token && user.role === 'admin';

    if (navAdminLink)     navAdminLink.classList.toggle('hidden', !isAdmin);
    if (sidebarAdminLink) sidebarAdminLink.classList.toggle('hidden', !isAdmin);
}

// Fermer avec la touche Échap
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.classList.contains('translate-x-full')) {
            toggleSidebar();
        }
    }
});

document.addEventListener('DOMContentLoaded', updateSidebar);