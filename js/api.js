// ============================================
// api.js — Couche API centralisée MethShop
// ============================================

const API_URL = 'http://localhost:3000/api';  // ← Backend Express

// Helper: headers avec token JWT
function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

// GET
async function get(url) {
    const response = await fetch(API_URL + url, {
        headers: getHeaders(),
        mode: 'cors'
    });
    if (!response.ok) throw new Error('Erreur ' + response.status);
    return response.json();
}

// POST
async function post(url, data) {
    const response = await fetch(API_URL + url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
        mode: 'cors'
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'Erreur ' + response.status);
    }
    return response.json();
}

// PUT
async function put(url, data) {
    const response = await fetch(API_URL + url, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
        mode: 'cors'
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'Erreur ' + response.status);
    }
    return response.json();
}

// DELETE
async function del(url) {
    const response = await fetch(API_URL + url, {
        method: 'DELETE',
        headers: getHeaders(),
        mode: 'cors'
    });
    if (!response.ok) throw new Error('Erreur ' + response.status);
    // 204 No Content → pas de JSON
    if (response.status === 204) return null;
    return response.json().catch(() => null);
}

// ── Auth ──────────────────────────────────────────
const registerUser = (data) => post('/register', data);
const loginUser    = (data) => post('/login', data);

// ── Products ──────────────────────────────────────
const getProducts  = (params = '') => get('/products?' + params);
const getProduct   = (id) => get(`/products/${id}`);

// ── Cart ──────────────────────────────────────────
const getCart           = ()                         => get('/cart');
const addToCart         = (data)                     => post('/cart/add', data);
const updateCartItem    = (productId, quantity)      => put(`/cart/${productId}`, { quantity });
const removeFromCart    = (productId)                => del(`/cart/${productId}`);
const clearCart         = ()                         => del('/cart');

// ── Orders ────────────────────────────────────────
const createOrder  = (data) => post('/orders', data);
const getMyOrders  = ()     => get('/orders/my-orders');

// ── Categories ────────────────────────────────────
const getCategories = () => get('/categories');

// ── Admin ─────────────────────────────────────────
const getStats = () => get('/admin/stats');

// ── Utilitaire : badge panier ─────────────────────
async function updateCartCount() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const cart = await getCart();
        const count = cart.items?.length || 0;
        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.textContent = count;
            badge.classList.toggle('hidden', count === 0);
        }
    } catch (error) {
        // Silencieux si non connecté
    }
}