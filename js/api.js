// api.js — Connexion au backend réel

const API_BASE_URL = 'https://mon-api-vnhx.onrender.com/api'; 

// ── Auth ──────────────────────────────────────
async function registerUser({ name, email, password }) {
    const res = await fetch(`${API_BASE_URL}/register`, {  // ← PAS /auth/register
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur inscription');
    return res.json();
}

async function loginUser({ email, password }) {
    const res = await fetch(`${API_BASE_URL}/login`, {  // ← PAS /auth/login
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur connexion');
    const data = await res.json();
    localStorage.setItem('token', data.token);
    return data;
}

// ── Products ──────────────────────────────────
async function getProducts(params = '') {
    const res = await fetch(`${API_BASE_URL}/products?${params}`);
    if (!res.ok) throw new Error('Erreur chargement produits');
    return res.json();
}

async function getProduct(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!res.ok) throw new Error('Produit introuvable');
    return res.json();
}

// ── Categories ────────────────────────────────
async function getCategories() {
    const res = await fetch(`${API_BASE_URL}/categories`);
    if (!res.ok) throw new Error('Erreur chargement catégories');
    return res.json();
}

// ── Cart ──────────────────────────────────────
async function addToCart({ productId, quantity = 1 }) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
    });
    if (!res.ok) throw new Error('Erreur ajout panier');
    return res.json();
}

async function getCartFull() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erreur chargement panier');
    return res.json();
}

async function updateCartItem(productId, quantity) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
    });
    if (!res.ok) throw new Error('Erreur mise à jour');
    return res.json();
}

async function removeFromCart(productId) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erreur suppression');
    return res.json();
}

async function clearCart() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erreur vidage');
    return res.json();
}

// ── Badge panier ──────────────────────────────
async function updateCartCount() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
        badge.classList.add('hidden');
        return;
    }
    
    try {
        const cart = await getCartFull();
        const count = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
        badge.textContent = count;
        badge.classList.toggle('hidden', count === 0);
    } catch (e) {
        console.error('Erreur badge:', e);
    }
}