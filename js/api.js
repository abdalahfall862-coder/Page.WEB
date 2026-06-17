// api.js — Connexion au backend réel

const API_BASE_URL = 'https://mon-api-vnhx.onrender.com/api';

function authHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

async function apiFetch(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeout);
        return res;
    } catch (e) {
        clearTimeout(timeout);
        if (e.name === 'AbortError') throw new Error('Le serveur met du temps à répondre. Réessayez.');
        throw e;
    }
}

// ── Auth ──────────────────────────────────────
async function registerUser({ name, email, password }) {
    const res = await apiFetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = (err.message || err.error || '').toLowerCase();
        if (msg.includes('password')) throw new Error("Mot de passe incorrect.");
        if (msg.includes('email') && (msg.includes('utilis') || msg.includes('déjà') || msg.includes('already'))) throw new Error("Email déjà utilisé. Utilisez un autre email.");
        throw new Error(err.message || err.error || 'Inscription refusée.');
    }
    return res.json();
}

async function loginUser({ email, password }) {
    const res = await apiFetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const messages = {
            401: "Email ou mot de passe incorrect.",
            404: "Aucun compte trouvé avec cet email.",
            429: "Trop de tentatives, réessayez plus tard.",
            500: "Erreur serveur, réessayez dans quelques instants."
        };
        throw new Error(messages[res.status] || err.error || "Erreur de connexion.");
    }
    const data = await res.json();
    localStorage.setItem('token', data.token);
    return data;
}

// ── Products ──────────────────────────────────
async function getProducts(params = '') {
    const res = await apiFetch(`${API_BASE_URL}/products?${params}`);
    if (!res.ok) throw new Error('Erreur chargement produits');
    return res.json();
}

async function getProduct(id) {
    const res = await apiFetch(`${API_BASE_URL}/products/${id}`);
    if (!res.ok) throw new Error('Produit introuvable');
    return res.json();
}

// ── Categories ────────────────────────────────
async function getCategories() {
    const res = await apiFetch(`${API_BASE_URL}/categories`);
    if (!res.ok) throw new Error('Erreur chargement catégories');
    return res.json();
}

// ── Cart ──────────────────────────────────────
async function addToCart({ productId, quantity = 1 }) {
    const res = await apiFetch(`${API_BASE_URL}/cart/add`, {  // ✅ /cart/add
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ productId, quantity })
    });
    if (!res.ok) throw new Error('Erreur ajout panier');
    return res.json();
}

async function getCartFull() {
    const res = await apiFetch(`${API_BASE_URL}/cart`, {
        headers: authHeaders()
    });
    if (!res.ok) throw new Error('Erreur chargement panier');
    return res.json();
}

async function updateCartItem(productId, quantity) {
    const res = await apiFetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ quantity })
    });
    if (!res.ok) throw new Error('Erreur mise à jour');
    return res.json();
}

async function removeFromCart(productId) {
    const res = await apiFetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    if (!res.ok) throw new Error('Erreur suppression');
    return res.json();
}

async function clearCart() {
    const res = await apiFetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    if (!res.ok) throw new Error('Erreur vidage');
    return res.json();
}

// ── Badge panier ──────────────────────────────
async function updateCartCount() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    const token = localStorage.getItem('token');
    if (!token) { badge.classList.add('hidden'); return; }
    try {
        const cart = await getCartFull();
        const count = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
        badge.textContent = count;
        badge.classList.toggle('hidden', count === 0);
    } catch (e) {
        console.error('Erreur badge:', e);
    }
}

// ── Reviews ───────────────────────────────────
async function addReview({ productId, authorName, rating, title, comment, type }) {
    const res = await apiFetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ productId, authorName, rating, title, comment, type })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur lors de l\'envoi de l\'avis.');
    }
    return res.json();
}

async function getProductReviews(productId) {
    const res = await apiFetch(`${API_BASE_URL}/reviews/product/${productId}`);
    if (!res.ok) throw new Error('Erreur chargement avis');
    return res.json();
}

async function getShopReviews() {
    const res = await apiFetch(`${API_BASE_URL}/reviews/shop`);
    if (!res.ok) throw new Error('Erreur chargement avis boutique');
    return res.json();
}