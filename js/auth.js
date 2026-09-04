// auth.js — Gestion authentification MethShop

// Bascule d'affichage qui respecte les classes responsives Tailwind
// (ex: "hidden md:block"). Toucher directement la classe "hidden" casserait
// le comportement mobile puisqu'elle ne serait alors plus jamais réappliquée
// en dessous du breakpoint md.
function setForcedHidden(el, forceHide) {
    if (!el) return;
    el.style.display = forceHide ? 'none' : '';
}

function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const authButtons = document.getElementById('auth-buttons');
    const userMenu    = document.getElementById('user-menu');
    const userName    = document.getElementById('user-name');

    const isLoggedIn = !!(token && user.name);

    setForcedHidden(authButtons, isLoggedIn);
    setForcedHidden(userMenu, !isLoggedIn);
    if (userName) userName.textContent = user.name || '';
}

async function login() {
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const message  = document.getElementById('message');

    if (!email || !password) {
        showMessage(message, 'Veuillez remplir tous les champs.', 'red');
        return;
    }
    try {
        const result = await loginUser({ email, password });
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        window.location.href = 'index.html';
    } catch (error) {
        showMessage(message, error.message, 'red');
    }
}

async function register() {
    const name     = document.getElementById('name').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const message  = document.getElementById('message');

    if (!name || !email || !password) {
        showMessage(message, 'Veuillez remplir tous les champs.', 'red');
        return;
    }
    if (password.length < 6) {
        showMessage(message, 'Le mot de passe doit faire au moins 6 caractères.', 'red');
        return;
    }
    try {
        await registerUser({ name, email, password });
        showMessage(message, 'Inscription réussie ! Redirection...', 'green');
        setTimeout(() => window.location.href = 'index.html', 1500);
    } catch (error) {
        showMessage(message, error.message, 'red');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function showMessage(el, text, color) {
    if (!el) return;
    el.textContent = text;
    el.style.color = color;
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updateCartCount();
});