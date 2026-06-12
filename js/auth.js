function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');
    
    if (token && user.name) {
        if (authButtons) authButtons.classList.add('hidden');
        if (userMenu) {
            userMenu.classList.remove('hidden');
            userMenu.classList.add('flex');
        }
        if (userName) userName.textContent = user.name;
    } else {
        if (authButtons) authButtons.classList.remove('hidden');
        if (userMenu) {
            userMenu.classList.add('hidden');
            userMenu.classList.remove('flex');
        }
    }
}

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');
    
    if (!email || !password) {
        message.textContent = 'Veuillez remplir tous les champs';
        message.style.color = 'red';
        return;
    }
    
    try {
        const result = await loginUser({ email, password });
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        window.location.href = 'products.html';
    } catch (error) {
        message.textContent = error.message;
        message.style.color = 'red';
    }
}

async function register() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');
    
    if (!name || !email || !password) {
        message.textContent = 'Veuillez remplir tous les champs';
        message.style.color = 'red';
        return;
    }
    
    try {
        await registerUser({ name, email, password });
        message.textContent = 'Inscription réussie ! Connectez-vous.';
        message.style.color = 'green';
        setTimeout(() => window.location.href = 'login.html', 1500);
    } catch (error) {
        message.textContent = error.message;
        message.style.color = 'red';
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// Vérifier auth au chargement
document.addEventListener('DOMContentLoaded', checkAuth);